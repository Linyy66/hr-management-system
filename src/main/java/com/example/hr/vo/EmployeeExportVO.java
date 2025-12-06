package com.example.hr.vo;

import lombok.Data;
import java.util.Date;

/**
 * 员工导出VO（适配Excel导出）
 */
@Data
public class EmployeeExportVO {
    /** 导出序号（自增） */
    private Integer serialNum;
    /** 员工编号 */
    private String empNo;
    /** 姓名 */
    private String name;
    /** 性别（中文：男/女） */
    private String gender;
    /** 年龄 */
    private Integer age;
    /** 联系电话 */
    private String phone;
    /** 邮箱 */
    private String email;
    /** 所属部门名称 */
    private String deptName;
    /** 职位名称 */
    private String jobName;
    /** 入职日期 */
    private Date hireDate;
    /** 状态（中文：在职/离职） */
    private String status;
}