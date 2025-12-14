package com.example.hr.controller;

import com.example.hr.dto.ApiResponse;
import com.example.hr.model.AttendanceRecord;
import com.example.hr.model.LeaveApplication;
import com.example.hr.model.OvertimeApplication;
import com.example.hr.model.StaffArchive;
import com.example.hr.repository.AttendanceRecordRepository;
import com.example.hr.repository.LeaveApplicationRepository;
import com.example.hr.repository.OvertimeApplicationRepository;
import com.example.hr.repository.StaffArchiveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

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
        // 注意：这里简化处理，实际应该通过某种方式关联用户和员工档案
        List<StaffArchive> archives = staffArchiveRepository.findAll();
        if (!archives.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(archives.get(0)));
        }
        return ResponseEntity.ok(ApiResponse.error("未找到员工档案"));
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
        
        // 注意：这里简化处理，实际应该通过员工档案ID查询
        List<AttendanceRecord> records = attendanceRecordRepository.findAll();
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
        
        // 检查是否今天已经打过卡
        boolean alreadyClockedIn = attendanceRecordRepository.findAll()
                .stream()
                .anyMatch(record -> record.getClockInTime().toLocalDate().equals(LocalDateTime.now().toLocalDate()) 
                        && record.getClockOutTime() == null);
        
        if (alreadyClockedIn) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("今天已经打过卡了"));
        }
        
        AttendanceRecord record = new AttendanceRecord();
        record.setId(System.currentTimeMillis());
        record.setUserId(currentUserId);
        record.setClockInTime(LocalDateTime.now());
        attendanceRecordRepository.save(record);
        
        return ResponseEntity.ok(ApiResponse.success("打卡成功", record));
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
        AttendanceRecord record = attendanceRecordRepository.findAll()
                .stream()
                .filter(r -> r.getClockInTime().toLocalDate().equals(LocalDateTime.now().toLocalDate()))
                .filter(r -> r.getClockOutTime() == null)
                .findFirst()
                .orElse(null);
        
        if (record == null) {
            return ResponseEntity.ok(ApiResponse.error("未找到打卡记录"));
        }
        
        record.setClockOutTime(LocalDateTime.now());
        attendanceRecordRepository.save(record);
        return ResponseEntity.ok(ApiResponse.success("签退成功", record));
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
        
        // 注意：这里简化处理，实际应该通过员工档案ID查询
        List<LeaveApplication> applications = leaveApplicationRepository.findAll();
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
        
        // 注意：这里简化处理，实际应该设置正确的员工档案ID
        leaveApplication.setArchiveId("000001"); // 示例ID
        leaveApplication.setApprovalStatus("PENDING");
        leaveApplication.setCreateTime(LocalDateTime.now());
        
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
        
        // 注意：这里简化处理，实际应该通过员工档案ID查询
        List<OvertimeApplication> applications = overtimeApplicationRepository.findAll();
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
        
        // 注意：这里简化处理，实际应该设置正确的员工档案ID
        overtimeApplication.setArchiveId("000001"); // 示例ID
        overtimeApplication.setApprovalStatus("PENDING");
        overtimeApplication.setCreateTime(LocalDateTime.now());
        
        OvertimeApplication savedApplication = overtimeApplicationRepository.save(overtimeApplication);
        return ResponseEntity.ok(ApiResponse.success("加班申请提交成功", savedApplication));
    }
}