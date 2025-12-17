package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;

@Entity
@Table(name = "t_user")
@Data
public class AppUser {
    @Id
    @Column(length = 50)
    private String username;

    @Column(nullable = false)
    private String password; // BCrypt 加密后的密码

    @Column(length = 30, nullable = false)
    private String role; // 存储: EMPLOYEE / HR_SPEC / HR_MANAGER / ADMIN

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(length = 18)
    private String idCard; // 身份证号

    @Column(length = 50)
    private String email; // 邮箱
}