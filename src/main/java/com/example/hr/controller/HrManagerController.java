package com.example.hr.controller;

import com.example.hr.model.*;
import com.example.hr.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/hr-manager")
public class HrManagerController {
    
    @Autowired
    private StaffArchiveRepository staffArchiveRepository;
    
    @Autowired
    private LeaveApplicationRepository leaveApplicationRepository;
    
    @Autowired
    private OvertimeApplicationRepository overtimeApplicationRepository;
    
    @Autowired
    private OrgLevel1Repository orgLevel1Repository;
    
    @Autowired
    private OrgLevel2Repository orgLevel2Repository;
    
    @Autowired
    private OrgLevel3Repository orgLevel3Repository;
    
    // Helper method to get current user ID
    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return null;
    }
    
    // 员工档案管理
    @GetMapping("/staff")
    public List<StaffArchive> getAllStaffArchives() {
        return staffArchiveRepository.findAll();
    }
    
    @GetMapping("/staff/{id}")
    public ResponseEntity<StaffArchive> getStaffArchive(@PathVariable String id) {
        return staffArchiveRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * 审批员工档案
     */
    @PutMapping("/staff/{id}/approve")
    public ResponseEntity<StaffArchive> approveStaffArchive(@PathVariable String id) {
        return staffArchiveRepository.findById(id).map(archive -> {
            archive.setStatus("NORMAL");
            archive.setUpdateTime(LocalDateTime.now());
            return ResponseEntity.ok(staffArchiveRepository.save(archive));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * 拒绝员工档案
     */
    @PutMapping("/staff/{id}/reject")
    public ResponseEntity<StaffArchive> rejectStaffArchive(@PathVariable String id, 
                                                          @RequestParam String reason) {
        return staffArchiveRepository.findById(id).map(archive -> {
            archive.setStatus("REJECTED");
            archive.setUpdateTime(LocalDateTime.now());
            // 在实际应用中，可以将拒绝原因保存到另一个表或字段中
            return ResponseEntity.ok(staffArchiveRepository.save(archive));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * 删除员工档案
     */
    @PutMapping("/staff/{id}/delete")
    public ResponseEntity<StaffArchive> deleteStaffArchive(@PathVariable String id) {
        return staffArchiveRepository.findById(id).map(archive -> {
            archive.setStatus("DELETED");
            archive.setUpdateTime(LocalDateTime.now());
            return ResponseEntity.ok(staffArchiveRepository.save(archive));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * 恢复员工档案
     */
    @PutMapping("/staff/{id}/restore")
    public ResponseEntity<StaffArchive> restoreStaffArchive(@PathVariable String id) {
        return staffArchiveRepository.findById(id).map(archive -> {
            archive.setStatus("NORMAL");
            archive.setUpdateTime(LocalDateTime.now());
            return ResponseEntity.ok(staffArchiveRepository.save(archive));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    // 请假审批
    @GetMapping("/leave-applications")
    public List<LeaveApplication> getAllPendingLeaveApplications() {
        return leaveApplicationRepository.findByStatus("PENDING");
    }
    
    @PutMapping("/leave-applications/{id}/approve")
    public ResponseEntity<LeaveApplication> approveLeaveApplication(@PathVariable Long id) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).build();
        }
        
        return leaveApplicationRepository.findById(id).map(application -> {
            application.setStatus("APPROVED");
            application.setApproveTime(LocalDateTime.now());
            // 在实际应用中，应该从安全上下文中获取当前用户作为审批人
            application.setApproverId(currentUserId); 
            return ResponseEntity.ok(leaveApplicationRepository.save(application));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/leave-applications/{id}/reject")
    public ResponseEntity<LeaveApplication> rejectLeaveApplication(@PathVariable Long id, 
                                                                 @RequestParam String reason) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).build();
        }
        
        return leaveApplicationRepository.findById(id).map(application -> {
            application.setStatus("REJECTED");
            application.setApproveTime(LocalDateTime.now());
            // 在实际应用中，应该从安全上下文中获取当前用户作为审批人
            application.setApproverId(currentUserId);
            // 在实际应用中，可以将拒绝原因保存到另一个表或字段中
            return ResponseEntity.ok(leaveApplicationRepository.save(application));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    // 加班审批
    @GetMapping("/overtime-applications")
    public List<OvertimeApplication> getAllPendingOvertimeApplications() {
        return overtimeApplicationRepository.findByStatus("PENDING");
    }
    
    @PutMapping("/overtime-applications/{id}/approve")
    public ResponseEntity<OvertimeApplication> approveOvertimeApplication(@PathVariable Long id) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).build();
        }
        
        return overtimeApplicationRepository.findById(id).map(application -> {
            application.setStatus("APPROVED");
            application.setApproveTime(LocalDateTime.now());
            // 在实际应用中，应该从安全上下文中获取当前用户作为审批人
            application.setApproverId(currentUserId);
            return ResponseEntity.ok(overtimeApplicationRepository.save(application));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/overtime-applications/{id}/reject")
    public ResponseEntity<OvertimeApplication> rejectOvertimeApplication(@PathVariable Long id,
                                                                       @RequestParam String reason) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).build();
        }
        
        return overtimeApplicationRepository.findById(id).map(application -> {
            application.setStatus("REJECTED");
            application.setApproveTime(LocalDateTime.now());
            // 在实际应用中，应该从安全上下文中获取当前用户作为审批人
            application.setApproverId(currentUserId);
            // 在实际应用中，可以将拒绝原因保存到另一个表或字段中
            return ResponseEntity.ok(overtimeApplicationRepository.save(application));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    // 组织架构查看（人事经理只能查看不能修改，除了三级机构名称）
    @GetMapping("/org/level1")
    public List<OrgLevel1> getAllOrgLevel1() {
        return orgLevel1Repository.findAll();
    }
    
    @GetMapping("/org/level2")
    public List<OrgLevel2> getAllOrgLevel2() {
        return orgLevel2Repository.findAll();
    }
    
    @GetMapping("/org/level3")
    public List<OrgLevel3> getAllOrgLevel3() {
        return orgLevel3Repository.findAll();
    }
    
    /**
     * 人事经理可以修改三级机构名称
     */
    @PutMapping("/org/level3/{id}")
    public ResponseEntity<OrgLevel3> updateOrgLevel3Name(@PathVariable String id, 
                                                        @RequestBody OrgLevel3 org) {
        return orgLevel3Repository.findById(id).map(existing -> {
            existing.setOrg3Name(org.getOrg3Name());
            existing.setUpdateTime(LocalDateTime.now());
            return ResponseEntity.ok(orgLevel3Repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }
}