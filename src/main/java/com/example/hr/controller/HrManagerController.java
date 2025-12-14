package com.example.hr.controller;

import com.example.hr.dto.ApiResponse;
import com.example.hr.model.*;
import com.example.hr.repository.*;
import com.example.hr.service.OrgStructureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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
    
    @Autowired
    private OrgStructureService orgStructureService;
    
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
                .orElseGet(() -> ResponseEntity.notFound().build());
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
        }).orElseGet(() -> ResponseEntity.notFound().build());
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
        }).orElseGet(() -> ResponseEntity.notFound().build());
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
        }).orElseGet(() -> ResponseEntity.notFound().build());
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
        }).orElseGet(() -> ResponseEntity.notFound().build());
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
        }).orElseGet(() -> ResponseEntity.notFound().build());
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
        }).orElseGet(() -> ResponseEntity.notFound().build());
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
        }).orElseGet(() -> ResponseEntity.notFound().build());
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
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // 组织架构管理
    @GetMapping("/org/level1")
    public List<OrgLevel1> getAllOrgLevel1() {
        return orgStructureService.getAllOrgLevel1();
    }
    
    @GetMapping("/org/level2")
    public List<OrgLevel2> getAllOrgLevel2() {
        return orgStructureService.getAllOrgLevel2();
    }
    
    @GetMapping("/org/level3")
    public List<OrgLevel3> getAllOrgLevel3() {
        return orgStructureService.getAllOrgLevel3();
    }
    
    // 创建二级机构
    @PostMapping("/org/level2")
    public ResponseEntity<ApiResponse<OrgLevel2>> createOrgLevel2(@RequestBody OrgLevel2 org) {
        // 检查一级机构是否存在
        if (!orgStructureService.existsOrgLevel1(org.getOrg1Id())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("指定的一级机构不存在"));
        }
        
        org.setCreateTime(LocalDateTime.now());
        org.setUpdateTime(LocalDateTime.now());
        OrgLevel2 savedOrg = orgLevel2Repository.save(org);
        return ResponseEntity.ok(ApiResponse.success("二级机构创建成功", savedOrg));
    }
    
    // 创建三级机构
    @PostMapping("/org/level3")
    public ResponseEntity<ApiResponse<OrgLevel3>> createOrgLevel3(@RequestBody OrgLevel3 org) {
        // 检查二级机构是否存在
        if (!orgStructureService.existsOrgLevel2(org.getOrg2Id())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("指定的二级机构不存在"));
        }
        
        org.setCreateTime(LocalDateTime.now());
        org.setUpdateTime(LocalDateTime.now());
        OrgLevel3 savedOrg = orgLevel3Repository.save(org);
        return ResponseEntity.ok(ApiResponse.success("三级机构创建成功", savedOrg));
    }
    
    /**
     * 人事经理可以修改三级机构名称
     */
    @PutMapping("/org/level3/{id}")
    public ResponseEntity<ApiResponse<OrgLevel3>> updateOrgLevel3Name(@PathVariable String id, 
                                                        @RequestBody OrgLevel3 org) {
        return orgLevel3Repository.findById(id).map(existing -> {
            existing.setOrg3Name(org.getOrg3Name());
            existing.setUpdateTime(LocalDateTime.now());
            OrgLevel3 saved = orgLevel3Repository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("三级机构更新成功", saved));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // 修改二级机构
    @PutMapping("/org/level2/{id}")
    public ResponseEntity<ApiResponse<OrgLevel2>> updateOrgLevel2(@PathVariable String id, @RequestBody OrgLevel2 org) {
        Optional<OrgLevel2> existingOpt = orgLevel2Repository.findById(id);
        if (!existingOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        OrgLevel2 existing = existingOpt.get();
        // 检查一级机构是否存在
        if (!org.getOrg1Id().equals(existing.getOrg1Id()) && 
            !orgStructureService.existsOrgLevel1(org.getOrg1Id())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("指定的一级机构不存在"));
        }
        
        existing.setOrg1Id(org.getOrg1Id());
        existing.setOrg2Name(org.getOrg2Name());
        existing.setUpdateTime(LocalDateTime.now());
        OrgLevel2 saved = orgLevel2Repository.save(existing);
        return ResponseEntity.ok(ApiResponse.success("二级机构更新成功", saved));
    }
    
    // 删除二级机构
    @DeleteMapping("/org/level2/{id}")
    public ResponseEntity<ApiResponse<String>> deleteOrgLevel2(@PathVariable String id) {
        if (!orgLevel2Repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        // 检查是否有下属三级机构
        List<OrgLevel3> childOrgs = orgStructureService.getOrgLevel3ByOrg2Id(id);
        if (!childOrgs.isEmpty()) {
            // 有下属机构，不能删除
            return ResponseEntity.status(409).body(ApiResponse.error("该二级机构下有三级机构，不能删除"));
        }
        orgLevel2Repository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("二级机构删除成功"));
    }
    
    // 删除三级机构
    @DeleteMapping("/org/level3/{id}")
    public ResponseEntity<ApiResponse<String>> deleteOrgLevel3(@PathVariable String id) {
        if (!orgLevel3Repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        orgLevel3Repository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("三级机构删除成功"));
    }
}