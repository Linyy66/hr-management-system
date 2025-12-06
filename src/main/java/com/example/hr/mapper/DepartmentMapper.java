package com.example.hr.mapper;

import com.example.hr.entity.Department;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 部门Mapper接口（对应XML：src/main/resources/mapper/DepartmentMapper.xml）
 */
@Mapper
public interface DepartmentMapper {

    /**
     * 新增部门
     */
    int insert(Department department);

    /**
     * 根据ID删除部门
     */
    int deleteById(Long id);

    /**
     * 根据ID更新部门（非空字段才更新）
     */
    int updateByIdSelective(Department department);

    /**
     * 根据ID查询部门
     */
    Department selectById(Long id);

    /**
     * 查询所有部门（支持树形结构查询）
     */
    List<Department> selectAll();

    /**
     * 根据父部门ID查询子部门
     */
    List<Department> selectByParentId(Long parentId);

    /**
     * 校验部门名称是否已存在（排除自身ID）
     */
    int countByName(@Param("deptName") String deptName, @Param("excludeId") Long excludeId);

    /**
     * 查询部门是否存在子部门
     */
    int countChildren(Long parentId);
}