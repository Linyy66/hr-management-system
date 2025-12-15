package com.example.hr.controller;

import com.example.hr.dto.ApiResponse;
import com.example.hr.model.AttendanceRecord;
import com.example.hr.model.DepartmentChangeRequest;
import com.example.hr.model.LeaveApplication;
import com.example.hr.model.OvertimeApplication;
import com.example.hr.model.StaffArchive;
import com.example.hr.repository.AttendanceRecordRepository;
import com.example.hr.repository.LeaveApplicationRepository;
import com.example.hr.repository.OvertimeApplicationRepository;
import com.example.hr.repository.StaffArchiveRepository;
import com.example.hr.repository.DepartmentChangeRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {
    
    @Autowired
    private StaffArchiveRepository staffArchiveRepository;
    
    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;
    
    @Autowired
    private LeaveApplicationRepository leaveApplicationRepository;
    
    @Autowired
    private OvertimeApplicationRepository overtimeApplicationRepository;
    
    @Autowired
    private DepartmentChangeRequestRepository departmentChangeRequestRepository;
    
    // Helper method to get current user ID
    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return null;
    }
    
    /**
     * 获取当前员工的档案信息
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<StaffArchive>> getMyProfile() {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未认证"));
        }
        
        // 根据用户ID查找对应的员工档案
        List<StaffArchive> archives = staffArchiveRepository.findByAccountId(currentUserId);
        StaffArchive archive = archives.isEmpty() ? null : archives.get(0);
        
        if (archive != null) {
            return ResponseEntity.ok(ApiResponse.success(archive));
        }
        return ResponseEntity.ok(ApiResponse.error("未找到员工档案"));
    }
    
    /**
     * 更新当前员工的档案信息
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<StaffArchive>> updateMyProfile(@RequestBody StaffArchive updatedArchive) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未认证"));
        }
        
        // 查找当前用户的档案
        List<StaffArchive> archives = staffArchiveRepository.findByAccountId(currentUserId);
        StaffArchive existingArchive = archives.isEmpty() ? null : archives.get(0);
        
        if (existingArchive == null) {
            return ResponseEntity.ok(ApiResponse.error("未找到员工档案"));
        }
        
        // 更新可编辑字段
        existingArchive.setStaffName(updatedArchive.getStaffName());
        existingArchive.setGender(updatedArchive.getGender());
        existingArchive.setAge(updatedArchive.getAge());
        existingArchive.setBio(updatedArchive.getBio());
        existingArchive.setMobile(updatedArchive.getMobile());
        existingArchive.setPhone(updatedArchive.getPhone());
        existingArchive.setEmail(updatedArchive.getEmail());
        existingArchive.setUpdateTime(LocalDateTime.now());
        
        StaffArchive savedArchive = staffArchiveRepository.save(existingArchive);
        return ResponseEntity.ok(ApiResponse.success(savedArchive));
    }
    
    /**
     * 获取我的考勤记录
     */
    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<List<AttendanceRecord>>> getMyAttendanceRecords() {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未认证"));
        }
        
        // 根据用户ID查询考勤记录
        List<AttendanceRecord> records = attendanceRecordRepository.findByUserId(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(records));
    }
    
    /**
     * 员工打卡
     */
    @PostMapping("/attendance/clock-in")
    public ResponseEntity<ApiResponse<AttendanceRecord>> clockIn() {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未认证"));
        }
        
        // 查找与当前用户关联的员工档案
        List<StaffArchive> archives = staffArchiveRepository.findByAccountId(currentUserId);
        StaffArchive archive = archives.isEmpty() ? null : archives.get(0);
        
        if (archive == null) {
            return ResponseEntity.ok(ApiResponse.error("未找到员工档案"));
        }
        
        // 检查是否今天已经打过卡
        List<AttendanceRecord> todayRecords = attendanceRecordRepository.findByUserId(currentUserId)
                .stream()
                .filter(record -> record.getClockInTime() != null && 
                        record.getClockInTime().toLocalDate().equals(LocalDateTime.now().toLocalDate()))
                .collect(Collectors.toList());
        
        boolean alreadyClockedIn = todayRecords.stream()
                .anyMatch(record -> record.getClockOutTime() == null);
        
        if (alreadyClockedIn) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("今天已经打过卡了"));
        }
        
        AttendanceRecord record = new AttendanceRecord();
        record.setUserId(currentUserId);
        record.setArchiveId(archive.getArchiveId()); // 设置员工档案ID
        record.setClockInTime(LocalDateTime.now());
        record.setCreateTime(LocalDateTime.now());
        record.setCreateBy(currentUserId);
        AttendanceRecord savedRecord = attendanceRecordRepository.save(record);
        
        return ResponseEntity.ok(ApiResponse.success("打卡成功", savedRecord));
    }
    
    /**
     * 员工签退
     */
    @PostMapping("/attendance/clock-out")
    public ResponseEntity<ApiResponse<AttendanceRecord>> clockOut() {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未认证"));
        }
        
        // 查找今天的打卡记录（尚未签退）
        AttendanceRecord record = attendanceRecordRepository.findByUserId(currentUserId)
                .stream()
                .filter(r -> r.getClockInTime() != null && 
                        r.getClockInTime().toLocalDate().equals(LocalDateTime.now().toLocalDate()))
                .filter(r -> r.getClockOutTime() == null)
                .findFirst()
                .orElse(null);
        
        if (record == null) {
            return ResponseEntity.ok(ApiResponse.error("未找到打卡记录"));
        }
        
        record.setClockOutTime(LocalDateTime.now());
        record.setUpdateTime(LocalDateTime.now());
        record.setUpdateBy(currentUserId);
        AttendanceRecord savedRecord = attendanceRecordRepository.save(record);
        return ResponseEntity.ok(ApiResponse.success("签退成功", savedRecord));
    }
    
    /**
     * 获取我的请假申请
     */
    @GetMapping("/leave")
    public ResponseEntity<ApiResponse<List<LeaveApplication>>> getMyLeaveApplications() {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未认证"));
        }
        
        // 查找与当前用户关联的员工档案
        List<StaffArchive> archives = staffArchiveRepository.findByAccountId(currentUserId);
        StaffArchive archive = archives.isEmpty() ? null : archives.get(0);
        
        if (archive == null) {
            return ResponseEntity.ok(ApiResponse.error("未找到员工档案"));
        }
        
        // 根据员工档案ID查询请假申请
        List<LeaveApplication> applications = leaveApplicationRepository.findByArchiveId(archive.getArchiveId());
        return ResponseEntity.ok(ApiResponse.success(applications));
    }
    
    /**
     * 提交请假申请
     */
    @PostMapping("/leave")
    public ResponseEntity<ApiResponse<LeaveApplication>> submitLeaveApplication(
            @RequestBody LeaveApplication leaveApplication) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未认证"));
        }
        
        // 查找与当前用户关联的员工档案
        List<StaffArchive> archives = staffArchiveRepository.findByAccountId(currentUserId);
        StaffArchive archive = archives.isEmpty() ? null : archives.get(0);
        
        if (archive == null) {
            return ResponseEntity.ok(ApiResponse.error("未找到员工档案"));
        }
        
        // 设置员工档案ID和其他必要字段
        leaveApplication.setArchiveId(archive.getArchiveId());
        leaveApplication.setApprovalStatus("PENDING");
        leaveApplication.setCreateTime(LocalDateTime.now());
        leaveApplication.setCreateBy(currentUserId);
        
        LeaveApplication savedApplication = leaveApplicationRepository.save(leaveApplication);
        return ResponseEntity.ok(ApiResponse.success("请假申请提交成功", savedApplication));
    }
    
    /**
     * 获取我的加班申请
     */
    @GetMapping("/overtime")
    public ResponseEntity<ApiResponse<List<OvertimeApplication>>> getMyOvertimeApplications() {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未认证"));
        }
        
        // 查找与当前用户关联的员工档案
        List<StaffArchive> archives = staffArchiveRepository.findByAccountId(currentUserId);
        StaffArchive archive = archives.isEmpty() ? null : archives.get(0);
        
        if (archive == null) {
            return ResponseEntity.ok(ApiResponse.error("未找到员工档案"));
        }
        
        // 根据员工档案ID查询加班申请
        List<OvertimeApplication> applications = overtimeApplicationRepository.findByArchiveId(archive.getArchiveId());
        return ResponseEntity.ok(ApiResponse.success(applications));
    }
    
    /**
     * 提交加班申请
     */
    @PostMapping("/overtime")
    public ResponseEntity<ApiResponse<OvertimeApplication>> submitOvertimeApplication(
            @RequestBody OvertimeApplication overtimeApplication) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未认证"));
        }
        
        // 查找与当前用户关联的员工档案
        List<StaffArchive> archives = staffArchiveRepository.findByAccountId(currentUserId);
        StaffArchive archive = archives.isEmpty() ? null : archives.get(0);
        
        if (archive == null) {
            return ResponseEntity.ok(ApiResponse.error("未找到员工档案"));
        }
        
        // 设置员工档案ID和其他必要字段
        overtimeApplication.setArchiveId(archive.getArchiveId());
        overtimeApplication.setApprovalStatus("PENDING");
        overtimeApplication.setCreateTime(LocalDateTime.now());
        overtimeApplication.setCreateBy(currentUserId);
        
        // 确保设置默认版本号
        if (overtimeApplication.getVersion() == null) {
            overtimeApplication.setVersion(1);
        }
        
        OvertimeApplication savedApplication = overtimeApplicationRepository.save(overtimeApplication);
        return ResponseEntity.ok(ApiResponse.success("加班申请提交成功", savedApplication));
    }
    
    /**
     * 获取我的调岗申请
     */
    @GetMapping("/transfer-requests")
    public ResponseEntity<ApiResponse<List<DepartmentChangeRequest>>> getMyTransferRequests() {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未认证"));
        }
        
        // 查找与当前用户关联的员工档案
        List<StaffArchive> archives = staffArchiveRepository.findByAccountId(currentUserId);
        StaffArchive archive = archives.isEmpty() ? null : archives.get(0);
        
        if (archive == null) {
            return ResponseEntity.ok(ApiResponse.error("未找到员工档案"));
        }
        
        // 根据员工档案ID查询调岗申请
        List<DepartmentChangeRequest> requests = departmentChangeRequestRepository.findByArchiveId(archive.getArchiveId());
        return ResponseEntity.ok(ApiResponse.success(requests));
    }
    
    /**
     * 提交调岗申请
     */
    @PostMapping("/transfer-request")
    public ResponseEntity<ApiResponse<DepartmentChangeRequest>> submitTransferRequest(
            @RequestBody DepartmentChangeRequest request) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未认证"));
        }

        // 查找与当前用户关联的员工档案
        List<StaffArchive> archives = staffArchiveRepository.findByAccountId(currentUserId);
        StaffArchive archive = archives.isEmpty() ? null : archives.get(0);

        if (archive == null) {
            return ResponseEntity.ok(ApiResponse.error("未找到员工档案"));
        }

        // 设置员工档案ID和其他必要字段
        request.setArchiveId(archive.getArchiveId());
        request.setOldOrg1Id(archive.getOrg1Id());
        request.setOldOrg2Id(archive.getOrg2Id());
        request.setOldOrg3Id(archive.getOrg3Id());
        request.setOldPositionId(archive.getPositionId());
        request.setApprovalStatus("PENDING");
        request.setCreateTime(LocalDateTime.now());
        request.setCreateBy(currentUserId);

        DepartmentChangeRequest savedRequest = departmentChangeRequestRepository.save(request);
        return ResponseEntity.ok(ApiResponse.success("调岗申请提交成功", savedRequest));
    }
}