package com.example.hr;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.example.hr.mapper")  // 扫描原生 MyBatis Mapper 接口
public class HrManagementSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(HrManagementSystemApplication.class, args);
        System.out.println("人力资源管理系统启动成功！访问地址：http://localhost:8080/hr/index.html");
    }
}