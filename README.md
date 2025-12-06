# HRMS Minimal Project 

这是一个按你要求的最简实现骨架，包含基础配置、数据库建表脚本、实体、Repository、最小的 Controller 以及基于内存的 Spring Security。
启动时输入http://localhost:8080/login.html
环境（根据你的要求）：
- JDK: 21
- Spring Boot: 2.6.14
- MySQL: 8.0.26
- Maven: 使用项目 pom 文件

如何启动：
1. 修改 src/main/resources/application.properties 中的数据库连接（spring.datasource.url/username/password）。
2. 使用你本地或容器中的 MySQL 创建数据库（例如：`CREATE DATABASE hrms_db;`）。
3. （可选）手动执行 schema.sql 创建表，或让 JPA 的 `spring.jpa.hibernate.ddl-auto=update` 自动建表。
4. 在项目根目录运行：`mvn clean spring-boot:run` 或 `mvn clean package && java -jar target/hrms-minimal-0.0.1-SNAPSHOT.jar`。

示例账号（内存）：
- 人事专员: spec / specpass (ROLE_HR_SPEC)
- 人事经理: mgr / mgrpass (ROLE_HR_MANAGER)
- 系统管理员: admin / adminpass (ROLE_ADMIN)

最小 API 示例：
- GET /api/org1              -> 列出一级机构
- POST /api/org1             -> 创建一级机构（JSON）
- GET /api/org1/{id}         -> 获取一级机构
- DELETE /api/org1/{id}      -> 删除一级机构
- GET /api/staff             -> 列出员工档案
- POST /api/staff            -> 创建员工档案（status=PENDING）
- GET /api/staff/{id}        -> 获取员工档案
- PUT /api/staff/{id}        -> 更新员工档案（提交后 status 重新设为 PENDING）

注意（重要）：
- 这是最简实现，仅用于快速搭建和验证数据模型与基本流。生产环境需要：
    - 完整的 DTO/验证、异常处理
    - 更细粒度的权限控制（基于数据库的角色与权限）
    - 审批流、变更履历、逻辑删除的细节实现
    - 密码加密（BCrypt）与用户持久化
    - 单元测试与集成测试
    - 日志与监控等