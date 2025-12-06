package com.example.hr.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.example.hr.interceptor.LoginInterceptor; // 假设存在登录拦截器

/**
 * Web MVC配置：注册拦截器、静态资源映射等
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /**
     * 注册拦截器（如登录校验、权限校验）
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 登录拦截器（排除登录/注册接口）
        registry.addInterceptor(new LoginInterceptor())
                .addPathPatterns("/**") // 拦截所有请求
                .excludePathPatterns(
                        "/api/auth/login",    // 登录接口
                        "/api/auth/register", // 注册接口
                        "/swagger-ui/**",     // Swagger文档
                        "/v3/api-docs/**"     // API文档
                );
    }

    /**
     * 静态资源映射（如上传的图片、前端静态文件）
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 映射本地文件路径到URL（例：访问http://localhost:8080/hr/upload/xxx.jpg 对应本地D:/upload/xxx.jpg）
        registry.addResourceHandler("/upload/**")
                .addResourceLocations("file:D:/upload/"); // 生产环境建议使用绝对路径

        // 映射classpath下的静态资源（默认已配置，此处为补充）
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
    }
}