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
            createEmployeeArchive(user);
        }
    }

    /**
     * 为新注册的员工创建档案
     * @param user 新注册的用户
     */
    private void createEmployeeArchive(AppUser user) {
        // 检查是否已存在该用户的档案
        if (staffArchiveRepository.findByAccountId(user.getUsername()).isEmpty()) {
            StaffArchive archive = new StaffArchive();
            
            // 生成唯一的档案ID
            String archiveId = "EMP" + UUID.randomUUID().toString().substring(0, 9).toUpperCase();
            archive.setArchiveId(archiveId);
            
            // 关联用户账号
            archive.setAccountId(user.getUsername());
            
            // 设置默认值
            archive.setStaffName(""); // 姓名初始为空，由员工首次登录时填写
            archive.setGender(""); // 性别初始为空
            archive.setOrg1Id("01"); // 默认分配到技术中心
            archive.setOrg2Id("0101"); // 默认分配到研发部
            archive.setOrg3Id("010101"); // 默认分配到后端开发组
            archive.setPositionId("P002"); // 默认职位为后端工程师
            archive.setMobile(""); // 手机号初始为空
            archive.setStatus("PENDING"); // 初始状态为待审批
            
            // 设置时间戳
            archive.setCreateTime(LocalDateTime.now());
            archive.setUpdateTime(LocalDateTime.now());
            archive.setCreateBy(user.getUsername());
            
            // 保存档案
            staffArchiveRepository.save(archive);
        }
    }
}