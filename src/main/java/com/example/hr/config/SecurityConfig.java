package com.example.hr.config;

import com.example.hr.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(@Lazy CustomUserDetailsService uds) {
        this.customUserDetailsService = uds;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder.userDetailsService(customUserDetailsService).passwordEncoder(passwordEncoder());
        return authBuilder.build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable() // demo 环境禁用 CSRF，生产请根据需要启用
                .authorizeRequests()
                // 静态资源和页面允许匿名访问
                .antMatchers("/", "/index.html", "/login.html", "/register.html", "/main.html", "/app/**", "/static/**").permitAll()
                // 允许通过 POST 自助注册员工账号（后端逻辑再判断）
                .antMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                // 获取当前用户信息需要认证
                .antMatchers("/api/auth/me").authenticated()
                // 管理其他 API 权限控制（与之前一致）
                .antMatchers("/api/org1/**").hasAnyRole("HR_SPEC","HR_MANAGER","ADMIN")
                .antMatchers("/api/staff/**").hasAnyRole("HR_SPEC","HR_MANAGER","ADMIN")
                .anyRequest().authenticated()
                .and()
                .httpBasic();
        return http.build();
    }
}