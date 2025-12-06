package com.example.hr.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Spring核心配置：全局通用Bean定义
 */
@Configuration
@EnableAspectJAutoProxy(exposeProxy = true) // 启用AOP代理，支持暴露代理对象
public class SpringConfig {

    /**
     * 密码加密器（Spring Security推荐使用BCrypt）
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 可在此处添加其他全局Bean，如：
    // - 时间工具类（LocalDateTimeFormatter）
    // - 缓存管理器（RedisCacheManager）
    // - 异步任务执行器（ThreadPoolTaskExecutor）
}