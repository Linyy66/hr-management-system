package com.example.hr.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * 数据源配置：自定义HikariCP连接池（Spring Boot默认已自动配置，此处为增强配置）
 */
@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;

    @Value("${spring.datasource.hikari.maximum-pool-size:10}")
    private int maxPoolSize;

    @Value("${spring.datasource.hikari.minimum-idle:5}")
    private int minIdle;

    @Value("${spring.datasource.hikari.idle-timeout:300000}")
    private long idleTimeout;

    @Bean
    public DataSource dataSource() {
        HikariConfig hikariConfig = new HikariConfig();
        hikariConfig.setJdbcUrl(url);
        hikariConfig.setUsername(username);
        hikariConfig.setPassword(password);
        hikariConfig.setDriverClassName(driverClassName);

        // 连接池优化配置
        hikariConfig.setMaximumPoolSize(maxPoolSize);    // 最大连接数
        hikariConfig.setMinimumIdle(minIdle);            // 最小空闲连接
        hikariConfig.setIdleTimeout(idleTimeout);        // 空闲超时时间（毫秒）
        hikariConfig.setConnectionTestQuery("SELECT 1"); // 连接校验SQL
        hikariConfig.setPoolName("HR-HikariCP");         // 连接池名称（便于监控）

        return new HikariDataSource(hikariConfig);
    }
}