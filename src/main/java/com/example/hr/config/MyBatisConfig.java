package com.example.hr.config;

import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.mybatis.spring.boot.autoconfigure.MybatisProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.io.IOException;

/**
 * MyBatis配置：整合MyBatis并启用事务管理
 */
@Configuration
@MapperScan("com.example.hr.mapper") // 扫描Mapper接口所在包
@EnableTransactionManagement // 启用注解事务
public class MyBatisConfig {

    @Autowired
    private DataSource dataSource; // 注入自定义数据源

    @Autowired
    private MybatisProperties mybatisProperties; // 注入application.yml中的mybatis配置

    /**
     * 配置SqlSessionFactory（MyBatis核心）
     */
    @Bean
    public SqlSessionFactoryBean sqlSessionFactory() throws IOException {
        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource); // 设置数据源

        // 设置Mapper XML文件路径（与application.yml配置一致）
        sessionFactory.setMapperLocations(
                new PathMatchingResourcePatternResolver()
                        .getResources("classpath:mapper/**/*.xml")
        );

        // 设置实体类别名包（简化XML中的类名引用）
        sessionFactory.setTypeAliasesPackage("com.example.hr.entity");

        // 应用全局配置（如驼峰命名转换）
        sessionFactory.setConfiguration(mybatisProperties.getConfiguration());

        return sessionFactory;
    }

    /**
     * 配置事务管理器
     */
    @Bean
    public PlatformTransactionManager transactionManager() {
        return new DataSourceTransactionManager(dataSource);
    }
}