package com.example.hr.config;

import com.example.hr.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
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
                .csrf().disable()
                .authorizeRequests()
                // 静态资源和页面允许匿名访问
                .antMatchers("/", "/index.html", "/login.html", "/register.html", "/main.html", "/app/**", "/static/**").permitAll()
                // 允许通过 POST 自助注册员工账号（后端再判断）
                .antMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                // 获取当前用户信息需要认证
                .antMatchers("/api/auth/me").authenticated()
                // roles 管理接口仍受 ADMIN 控制
                .antMatchers("/api/roles/**").hasRole("ADMIN")
                // org / staff 访问控制
                .antMatchers("/api/org1/**").hasAnyRole("HR_SPEC","HR_MANAGER","ADMIN")
                .antMatchers("/api/staff/**").hasAnyRole("HR_SPEC","HR_MANAGER","ADMIN")
                // 机构管理权限控制
                .antMatchers("/api/org/level1/**").hasRole("ADMIN")
                .antMatchers("/api/org/level2/**").hasRole("ADMIN")
                .antMatchers("/api/org/level3/**").hasAnyRole("ADMIN", "HR_MANAGER")
                .antMatchers("/api/positions/**").hasRole("ADMIN")
                // 其余接口默认认证
                .anyRequest().authenticated()
                .and()
                .httpBasic();
        return http.build();
    }
}