package com.example.hr.listener;

import com.example.hr.model.AppUser;
import com.example.hr.model.StaffArchive;
import com.example.hr.repository.StaffArchiveRepository;
import com.example.hr.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
public class UserRegistrationListener {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StaffArchiveRepository staffArchiveRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    /**
     * 监听用户注册事件，当注册为员工时自动创建员工档案
     */
    @EventListener
    @Transactional
    public void handleUserRegistration(AppUser user) {
        // 只有当用户角色为员工时才创建员工档案
        if ("EMPLOYEE".equals(user.getRole())) {
            System.out.println("Processing employee registration for user: " + user.getUsername());
            // 检查是否已经存在员工档案
            List<StaffArchive> existingArchives = staffArchiveRepository.findByAccountId(user.getUsername());
            
            if (existingArchives.isEmpty()) {
                System.out.println("No staff archive found for user: " + user.getUsername() + ", creating new one.");
                createEmployeeArchive(user);
            } else {
                System.out.println("Staff archive already exists for user: " + user.getUsername());
            }
        }
    }

    /**
     * 创建员工档案
     */
    private void createEmployeeArchive(AppUser user) {
        try {
            // 生成随机员工编号
            String archiveId = "EMP" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            
            // 创建员工档案
            StaffArchive archive = new StaffArchive();
            archive.setArchiveId(archiveId);
            archive.setAccountId(user.getUsername()); // 关键：设置账号ID为用户名
            archive.setStaffName(user.getUsername()); // 初始姓名为用户名
            archive.setGender("M"); // 默认性别为男
            archive.setAge(18); // 默认年龄为18
            // 使用默认值或从其他来源获取手机号和邮箱
            archive.setMobile("13800138000"); // 默认手机号
            archive.setIdCard("110101199001011234"); // 默认身份证号
            archive.setEmail("user@example.com"); // 默认邮箱
            archive.setBio("一切都很顺利"); // 默认自我介绍
            archive.setStatus("NORMAL"); // 默认状态为正常
            archive.setCreateBy(user.getUsername());
            archive.setCreateTime(LocalDateTime.now());
            archive.setVersion(1);
            
            // 设置默认机构和职位（需要根据实际业务逻辑调整）
            archive.setOrg1Id("01"); // 默认一级机构ID
            archive.setOrg2Id("0101"); // 默认二级机构ID
            archive.setOrg3Id("010101"); // 默认三级机构ID
            archive.setPositionId("P002"); // 默认职位ID
            
            staffArchiveRepository.save(archive);
            
            // 添加日志
            System.out.println("自动创建员工档案: " + archiveId + " 关联账号: " + user.getUsername());
        } catch (Exception e) {
            System.err.println("Failed to create employee archive for user: " + user.getUsername() + ", error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}