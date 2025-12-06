package com.example.hr.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

/**
 * 文件上传工具类
 */
@Component
public class FileUploadUtils {

    // 上传根路径（从配置文件读取）
    @Value("${file.upload.base-path:D:/upload}")
    private String basePath;

    // 访问基础URL（如：http://localhost:8080/hr/upload/）
    @Value("${file.upload.access-url:/upload/}")
    private String accessUrl;

    /**
     * 上传文件
     * @param file 上传的文件
     * @param module 模块名（用于分类存储）
     * @return 文件访问URL
     */
    public String upload(MultipartFile file, String module) throws IOException {
        // 1. 创建目录（按模块+日期分类）
        String dateDir = new SimpleDateFormat("yyyyMMdd").format(new Date());
        String uploadDir = basePath + File.separator + module + File.separator + dateDir;
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs(); // 递归创建目录
        }

        // 2. 生成文件名（UUID+原文件后缀）
        String originalFilename = file.getOriginalFilename();
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + suffix;

        // 3. 保存文件
        File dest = new File(uploadDir, filename);
        file.transferTo(dest);

        // 4. 构建访问URL
        return accessUrl + module + "/" + dateDir + "/" + filename;
    }

    /**
     * 删除文件
     * @param url 文件访问URL
     */
    public void delete(String url) {
        if (url == null || !url.startsWith(accessUrl)) {
            return;
        }
        // 从URL解析出文件路径
        String filePath = basePath + url.substring(accessUrl.length()).replace("/", File.separator);
        File file = new File(filePath);
        if (file.exists()) {
            file.delete();
        }
    }
}