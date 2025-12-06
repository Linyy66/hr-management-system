package com.example.hr.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.math.BigDecimal;

/**
 * 员工更新请求DTO
 */
@Data
public class EmployeeUpdateDTO {

    @Size(max = 20, message = "员工姓名长度不能超过20个字符")
    private String name; // 姓名（可选）

    @Pattern(regexp = "^(男|女)$", message = "性别只能是'男'或'女'")
    private String gender; // 性别（可选）

    @Past(message = "出生日期必须是过去的日期")
    private LocalDate birthDate; // 出生日期（可选）

    @Pattern(regexp = "^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9Xx]$",
            message = "身份证号格式不正确")
    private String idCard; // 身份证号（可选）

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone; // 联系电话（可选）

    private Long deptId; // 所属部门ID（可选）

    private Long positionId; // 职位ID（可选）

    @DecimalMin(value = "0", message = "薪资不能为负数")
    private BigDecimal salary; // 薪资（可选）

    @Size(max = 500, message = "备注长度不能超过500个字符")
    private String remark; // 备注（可选）
}