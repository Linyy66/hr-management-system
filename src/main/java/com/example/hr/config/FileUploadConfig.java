package com.example.hr.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

import jakarta.servlet.MultipartConfigElement;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.util.unit.DataSize;

/**
 * 文件上传配置：支持大文件上传（适配Spring Boot 3.x的Jakarta Servlet）
 */
@Configuration
public class FileUploadConfig {

    /**
     * 配置文件上传解析器（替换旧版commons-fileupload，使用Spring原生支持）
     */
    @Bean
    public MultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }

    /**
     * 配置文件上传限制（大小、临时路径等）
     */
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();

        // 单个文件最大大小（10MB）
        factory.setMaxFileSize(DataSize.ofMegabytes(10));
        // 总请求大小（50MB）
        factory.setMaxRequestSize(DataSize.ofMegabytes(50));
        // 临时文件存储路径（默认使用系统临时目录）
        // factory.setLocation("/tmp/upload");

        return factory.createMultipartConfig();
    }
}