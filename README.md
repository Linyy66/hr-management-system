# hr-management-system
基于Java Spring Boot + Vue 3开发，聚焦员工档案与薪酬管理，支持多人协作及MySQL主从复制实现双机数据实时同步，适配小型企业需求。
核心功能：1. 系统管理：维护三级机构关系、关联机构设职位、自定义薪酬项目；2. 档案管理：员工信息登记（含照片）、档案复核、多条件查询及逻辑删改；3. 薪酬管理：制定职位职称薪酬标准、登记发放单（支持奖惩录入）、复核同步及明细查询。

技术栈：后端Java 17+Spring Boot 3.2+MyBatis-Plus+MySQL 8.0，Spring Security+JWT控权；前端Vue 3+Element Plus+Axios；Maven构建，Git+GitHub版本控制。

快速开始：环境需JDK17+、MySQL8.0+、Maven3.8+、Node16+；克隆仓库后，初始化数据库hr_management，配置连接信息即可启动前后端。
