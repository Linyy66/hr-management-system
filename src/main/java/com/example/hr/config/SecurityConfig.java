package com.example.hr.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SuppressWarnings("deprecation")
@Configuration
public class SecurityConfig implements WebMvcConfigurer {

    // 静态资源映射（强制指定）
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**") // 匹配所有访问路径
                .addResourceLocations("classpath:/static/") // 静态资源在static目录下
                .resourceChain(false); // 关闭资源链缓存（开发环境用）
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                // 核心修复1：恢复Basic Auth（前端登录依赖此认证方式）
                // 仅禁用浏览器默认弹窗，保留请求头认证逻辑
                .httpBasic()
                .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests()
                // 放行静态资源+新增注册页/注册接口（为后续注册功能预留）
                .antMatchers("/", "/login.html", "/main.html", "/register.html", "/app/**", "/api/register").permitAll()
                // 核心修复2：细化API权限，顶级账号全覆盖
                .antMatchers("/api/admin/**").hasRole("ADMIN") // 管理员专属接口
                .antMatchers("/api/hr/**").hasAnyRole("HR_MANAGER", "ADMIN") // 经理+管理员
                .antMatchers("/api/staff/**").hasAnyRole("HR_SPEC", "HR_MANAGER", "ADMIN") // 专员+经理+管理员
                .antMatchers("/api/employee/**").hasAnyRole("EMPLOYEE", "HR_SPEC", "HR_MANAGER", "ADMIN") // 普通员工+所有HR角色
                // 其他API需认证（顶级账号自动满足）
                .antMatchers("/api/**").authenticated()
                // 兜底规则：所有请求需认证
                .anyRequest().authenticated()
                // 异常处理：权限不足时提示（而非直接跳登录）
                .and()
                .exceptionHandling()
                .accessDeniedHandler((request, response, ex) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(403);
                    response.getWriter().write("{\"message\":\"权限不足，请使用更高权限账号登录\"}");
                });

        return http.build();
    }

    @Bean
    public static NoOpPasswordEncoder passwordEncoder() {
        return (NoOpPasswordEncoder) NoOpPasswordEncoder.getInstance();
    }

    @Bean
    public org.springframework.security.core.userdetails.UserDetailsService userDetailsService() {
        var uds = new org.springframework.security.provisioning.InMemoryUserDetailsManager();
        // 核心修复3：密码添加{noop}前缀（Spring Security 5+强制要求，否则认证失败）
        uds.createUser(org.springframework.security.core.userdetails.User.withUsername("spec")
                .password("{noop}specpass").roles("HR_SPEC").build());
        uds.createUser(org.springframework.security.core.userdetails.User.withUsername("mgr")
                .password("{noop}mgrpass").roles("HR_MANAGER").build());
        uds.createUser(org.springframework.security.core.userdetails.User.withUsername("admin")
                .password("{noop}adminpass").roles("ADMIN").build());
        // 新增：普通员工角色（为注册功能预留）
        uds.createUser(org.springframework.security.core.userdetails.User.withUsername("emp")
                .password("{noop}emppass").roles("EMPLOYEE").build());
        return uds;
    }
}