package com.example.hr.mapper;

import com.example.hr.entity.Employee;
import com.example.hr.dto.EmployeeQueryDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 员工Mapper接口（对应XML：src/main/resources/mapper/EmployeeMapper.xml）
 */
@Mapper
public interface EmployeeMapper {

    /**
     * 新增员工
     */
    int insert(Employee employee);

    /**
     * 批量新增员工
     */
    int batchInsert(@Param("list") List<Employee> employees);

    /**
     * 根据ID删除员工
     */
    int deleteById(Long id);

    /**
     * 批量删除员工
     */
    int batchDelete(@Param("ids") List<Long> ids);

    /**
     * 根据ID更新员工（非空字段才更新）
     */
    int updateByIdSelective(Employee employee);

    /**
     * 根据ID查询员工
     */
    Employee selectById(Long id);

    /**
     * 根据部门ID查询员工
     */
    List<Employee> selectByDeptId(Long deptId);

    /**
     * 根据职位ID查询员工
     */
    List<Employee> selectByPositionId(Long positionId);

    /**
     * 分页查询员工（带条件）
     */
    List<Employee> selectByPage(
            @Param("query") EmployeeQueryDTO query,
            @Param("offset") int offset,
            @Param("pageSize") int pageSize
    );

    /**
     * 统计符合条件的员工总数（用于分页）
     */
    int countByQuery(@Param("query") EmployeeQueryDTO query);

    /**
     * 校验身份证号是否已存在（排除自身ID）
     */
    int countByIdCard(@Param("idCard") String idCard, @Param("excludeId") Long excludeId);
}