package com.example.hr.controller;

import com.example.hr.dto.ApiResponse;
import com.example.hr.model.*;
import com.example.hr.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {
    
    @Autowired
    private StaffArchiveRepository staffArchiveRepository;
    
    @Autowired
    private EmployeeProfileRepository employeeProfileRepository;
    
    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;
    
    @Autowired
    private LeaveApplicationRepository leaveApplicationRepository;
    
    @Autowired
    private OvertimeApplicationRepository overtimeApplicationRepository;
    
    @Autowired
    private DepartmentChangeRequestRepository departmentChangeRequestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ResignationApplicationRepository resignationApplicationRepository;
    
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
    public ResponseEntity<ApiResponse<EmployeeProfile>> getMyProfile() {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未认证"));
        }
        
        // 根据用户ID查找对应的员工个人信息
        Optional<EmployeeProfile> profileOpt = employeeProfileRepository.findOneByAccountId(currentUserId);
        if (!profileOpt.isPresent()) {
            return ResponseEntity.ok(ApiResponse.error("未找到员工个人信息"));
        }
        
        EmployeeProfile profile = profileOpt.get();
        // 检查员工状态，如果已经离职则不允许访问
        List<StaffArchive> archives = staffArchiveRepository.findByAccountId(currentUserId);
        if (!archives.isEmpty()) {
            StaffArchive archive = archives.get(0);
            if ("RESIGNED".equals(archive.getStatus())) {
                return ResponseEntity.status(403).body(ApiResponse.error("员工已离职，无法访问"));
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
    
    /**
     * 更新当前员工的档案信息
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<EmployeeProfile>> updateMyProfile(@RequestBody EmployeeProfile updatedProfile) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未认证"));
        }
        
        // 根据用户ID查找对应的员工个人信息
        Optional<EmployeeProfile> profileOpt = employeeProfileRepository.findOneByAccountId(currentUserId);
        if (!profileOpt.isPresent()) {
            return ResponseEntity.ok(ApiResponse.error("未找到员工个人信息"));
        }
        
        EmployeeProfile existingProfile = profileOpt.get();
        
        // 检查员工状态，如果已经离职则不允许更新
        List<StaffArchive> archives = staffArchiveRepository.findByAccountId(currentUserId);
        if (!archives.isEmpty()) {
            StaffArchive archive = archives.get(0);
            if ("RESIGNED".equals(archive.getStatus())) {
                return ResponseEntity.status(403).body(ApiResponse.error("员工已离职，无法更新"));
            }
        }
        
        // 更新可编辑字段
        existingProfile.setStaffName(updatedProfile.getStaffName());
        existingProfile.setGender(updatedProfile.getGender());
        existingProfile.setAge(updatedProfile.getAge());
        existingProfile.setBio(updatedProfile.getBio());
        existingProfile.setMobile(updatedProfile.getMobile());
        existingProfile.setPhone(updatedProfile.getPhone());
        existingProfile.setEmail(updatedProfile.getEmail());
        existingProfile.setAddress(updatedProfile.getAddress());
        existingProfile.setEmergencyContact(updatedProfile.getEmergencyContact());
        existingProfile.setEmergencyPhone(updatedProfile.getEmergencyPhone());
        existingProfile.setUpdateTime(LocalDateTime.now());
        
        EmployeeProfile savedProfile = employeeProfileRepository.save(existingProfile);
        return ResponseEntity.ok(ApiResponse.success(savedProfile));
    }
    
    /**
     * 员工提交离职申请
     */
    @PostMapping("/resign")
    public ResponseEntity<ApiResponse<String>> submitResignation(@RequestBody ResignationRequest request) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未认证"));
        }
        
        // 根据用户ID查找对应的员工档案
        List<StaffArchive> archives = staffArchiveRepository.findByAccountId(currentUserId);
        if (archives.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("未找到员工档案"));
        }
        
        StaffArchive existingArchive = archives.get(0);
        
        // 检查员工状态，如果已经离职或已提交离职申请则不允许再次提交
        if ("RESIGNED".equals(existingArchive.getStatus())) {
            return ResponseEntity.status(400).body(ApiResponse.error("员工已离职，无法提交离职申请"));
        }
        
        if ("RESIGN_PENDING".equals(existingArchive.getStatus())) {
            return ResponseEntity.status(400).body(ApiResponse.error("已提交离职申请，无需重复提交"));
        }
        
        // 创建离职申请记录
        ResignationApplication resignationApp = new ResignationApplication();
        resignationApp.setArchiveId(existingArchive.getArchiveId());
        resignationApp.setReason(request.getReason());
        resignationApp.setCreateTime(LocalDateTime.now());
        resignationApp.setUpdateTime(LocalDateTime.now());
        resignationApplicationRepository.save(resignationApp);
        
        // 更新员工档案状态为离职申请中
        existingArchive.setStatus("RESIGN_PENDING");
        existingArchive.setUpdateTime(LocalDateTime.now());
        staffArchiveRepository.save(existingArchive);
        
        return ResponseEntity.ok(ApiResponse.success("离职申请已提交，等待人事经理审批"));
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
        
        // 检查员工状态，如果已经离职则不允许打卡
        if ("RESIGNED".equals(archive.getStatus())) {
            return ResponseEntity.status(403).body(ApiResponse.error("员工已离职，无法打卡"));
        }
        
        // 检查今天是否已经打过卡
        // 注意：这里需要更复杂的逻辑来检查是否已经打过卡，为了简化示例省略了这部分
        
        AttendanceRecord record = new AttendanceRecord();
        record.setUserId(currentUserId);
        record.setArchiveId(archive.getArchiveId()); // 关联员工档案ID
        record.setClockInTime(LocalDateTime.now());
        // 使用 clockInTime 的日期部分作为工作日期
        record.setCreateTime(LocalDateTime.now());
        
        AttendanceRecord savedRecord = attendanceRecordRepository.save(record);
        return ResponseEntity.ok(ApiResponse.success(savedRecord));
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
        
        // 查找与当前用户关联的员工档案
        List<StaffArchive> archives = staffArchiveRepository.findByAccountId(currentUserId);
        StaffArchive archive = archives.isEmpty() ? null : archives.get(0);
        
        if (archive == null) {
            return ResponseEntity.ok(ApiResponse.error("未找到员工档案"));
        }
        
        // 检查员工状态，如果已经离职则不允许签退
        if ("RESIGNED".equals(archive.getStatus())) {
            return ResponseEntity.status(403).body(ApiResponse.error("员工已离职，无法签退"));
        }
        
        // 查找今天的考勤记录
        LocalDate today = LocalDate.now();
        List<AttendanceRecord> todayRecords = attendanceRecordRepository
                .findByUserIdAndClockInTimeBetween(currentUserId, today, today.plusDays(1));
        
        if (todayRecords.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("未找到今天的考勤记录"));
        }
        
        // 获取最后一条记录
        AttendanceRecord record = todayRecords.get(todayRecords.size() - 1);
        
        // 检查是否已经签退
        if (record.getClockOutTime() != null) {
            return ResponseEntity.ok(ApiResponse.error("今天已经签退过了"));
        }
        
        record.setClockOutTime(LocalDateTime.now());
        record.setUpdateTime(LocalDateTime.now());
        AttendanceRecord savedRecord = attendanceRecordRepository.save(record);
        return ResponseEntity.ok(ApiResponse.success(savedRecord));
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
        
        // 检查员工状态，如果已经离职则不允许提交请假申请
        if ("RESIGNED".equals(archive.getStatus())) {
            return ResponseEntity.status(403).body(ApiResponse.error("员工已离职，无法提交请假申请"));
        }
        
        // 设置关联的员工档案ID
        leaveApplication.setArchiveId(archive.getArchiveId());
        leaveApplication.setApprovalStatus("PENDING");
        leaveApplication.setCreateTime(LocalDateTime.now());
        leaveApplication.setUpdateTime(LocalDateTime.now());
        
        LeaveApplication savedApplication = leaveApplicationRepository.save(leaveApplication);
        return ResponseEntity.ok(ApiResponse.success(savedApplication));
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
        
        // 检查员工状态，如果已经离职则不允许提交加班申请
        if ("RESIGNED".equals(archive.getStatus())) {
            return ResponseEntity.status(403).body(ApiResponse.error("员工已离职，无法提交加班申请"));
        }
        
        // 设置关联的员工档案ID
        overtimeApplication.setArchiveId(archive.getArchiveId());
        overtimeApplication.setApprovalStatus("PENDING");
        overtimeApplication.setCreateTime(LocalDateTime.now());
        overtimeApplication.setUpdateTime(LocalDateTime.now());
        
        OvertimeApplication savedApplication = overtimeApplicationRepository.save(overtimeApplication);
        return ResponseEntity.ok(ApiResponse.success(savedApplication));
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
        
        // 检查员工状态，如果已经离职则不允许提交调岗申请
        if ("RESIGNED".equals(archive.getStatus())) {
            return ResponseEntity.status(403).body(ApiResponse.error("员工已离职，无法提交调岗申请"));
        }
        
        // 设置关联的员工档案ID和其他字段
        request.setArchiveId(archive.getArchiveId());
        request.setOldOrg1Id(archive.getOrg1Id());
        request.setOldOrg2Id(archive.getOrg2Id());
        request.setOldOrg3Id(archive.getOrg3Id());
        request.setOldPositionId(archive.getPositionId());
        request.setApprovalStatus("PENDING");
        request.setCreateTime(LocalDateTime.now());
        request.setUpdateTime(LocalDateTime.now());
        
        DepartmentChangeRequest savedRequest = departmentChangeRequestRepository.save(request);
        return ResponseEntity.ok(ApiResponse.success(savedRequest));
    }
    
    // 离职申请请求数据传输对象
    public static class ResignationRequest {
        private String reason;
        
        public String getReason() {
            return reason;
        }
        
        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}