package com.example.hr.controller;

import com.example.hr.dto.ApiResponse;
import com.example.hr.model.AttendanceRule;
import com.example.hr.repository.AttendanceRuleRepository;
import com.example.hr.repository.OrgLevel1Repository;
import com.example.hr.repository.OrgLevel2Repository;
import com.example.hr.repository.OrgLevel3Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/hr-manager")
public class HrManagerAttendanceController {
    
    @Autowired
    private AttendanceRuleRepository attendanceRuleRepository;
    
    @Autowired
    private OrgLevel1Repository orgLevel1Repository;
    
    @Autowired
    private OrgLevel2Repository orgLevel2Repository;
    
    @Autowired
    private OrgLevel3Repository orgLevel3Repository;
    
    // 获取所有考勤规则
    @GetMapping("/attendance-rules")
    public ResponseEntity<ApiResponse<List<AttendanceRule>>> getAllAttendanceRules() {
        List<AttendanceRule> rules = attendanceRuleRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(rules));
    }
    
    // 创建考勤规则
    @PostMapping("/attendance-rules")
    public ResponseEntity<ApiResponse<AttendanceRule>> createAttendanceRule(@RequestBody AttendanceRule rule) {
        // 检查三级机构是否存在
        if (!orgLevel3Repository.existsById(rule.getOrg3Id())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("指定的三级机构不存在"));
        }
        
        rule.setCreateTime(LocalDateTime.now());
        rule.setCreateBy(getCurrentUserId());
        AttendanceRule savedRule = attendanceRuleRepository.save(rule);
        return ResponseEntity.ok(ApiResponse.success("考勤规则创建成功", savedRule));
    }
    
    // 更新考勤规则
    @PutMapping("/attendance-rules/{id}")
    public ResponseEntity<ApiResponse<AttendanceRule>> updateAttendanceRule(@PathVariable Long id, @RequestBody AttendanceRule rule) {
        return (ResponseEntity<ApiResponse<AttendanceRule>>) attendanceRuleRepository.findById(id).map(existing -> {
            // 检查三级机构是否存在
            if (!orgLevel3Repository.existsById(rule.getOrg3Id())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("指定的三级机构不存在"));
            }
            
            existing.setOrg3Id(rule.getOrg3Id());
            existing.setRuleJson(rule.getRuleJson());
            existing.setStatus(rule.getStatus());
            AttendanceRule saved = attendanceRuleRepository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("考勤规则更新成功", saved));
        }).orElseGet(() -> ResponseEntity.<ApiResponse<AttendanceRule>>notFound().build());
    }
    
    // 删除考勤规则
    @DeleteMapping("/attendance-rules/{id}")
    public ResponseEntity<ApiResponse<String>> deleteAttendanceRule(@PathVariable Long id) {
        if (!attendanceRuleRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        attendanceRuleRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("考勤规则删除成功"));
    }
    
    // 获取当前用户ID
    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return null;
    }
}