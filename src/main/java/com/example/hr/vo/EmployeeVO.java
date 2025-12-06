package com.example.hr.vo;

import lombok.Data;
import java.util.Date;

/**
 * 员工展示VO（适配列表、详情页）
 */
@Data
public class EmployeeVO {
    /** 员工ID */
    private Long id;
    /** 员工编号 */
    private String empNo;
    /** 姓名 */
    private String name;
    /** 性别（中文：男/女） */
    private String gender;
    /** 年龄 */
    private Integer age;
    /** 身份证号（脱敏：110****1234） */
    private String idCard;
    /** 联系电话 */
    private String phone;
    /** 邮箱 */
    private String email;
    /** 所属部门名称 */
    private String deptName;
    /** 职位名称 */
    private String jobName;
    /** 岗位名称 */
    private String positionName;
    /** 入职日期 */
    private Date hireDate;
    /** 状态（中文：在职/离职/试用期） */
    private String status;
    /** 头像URL */
    private String avatar;
    /** 直接上级姓名 */
    private String managerName;
    /** 创建时间 */
    private Date createTime;
}