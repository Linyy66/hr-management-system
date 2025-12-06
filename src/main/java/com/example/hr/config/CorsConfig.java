package com.example.hr.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * 跨域配置：解决前后端分离架构下的跨域请求问题
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        // 1. 配置跨域信息
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOriginPattern("*"); // 允许所有来源（生产环境建议指定具体域名）
        config.setAllowCredentials(true);    // 允许携带Cookie
        config.addAllowedMethod("*");        // 允许所有HTTP方法（GET/POST/PUT/DELETE等）
        config.addAllowedHeader("*");        // 允许所有请求头
        config.addExposedHeader("Authorization"); // 允许前端获取的自定义响应头
        config.setMaxAge(3600L);             // 预检请求有效期（1小时，减少重复校验）

        // 2. 配置生效路径
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // 所有接口生效

        return new CorsFilter(source);
    }
}