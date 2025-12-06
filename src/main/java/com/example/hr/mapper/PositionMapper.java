package com.example.hr.mapper;

import com.example.hr.entity.Position;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 职位Mapper接口（对应XML：src/main/resources/mapper/PositionMapper.xml）
 */
@Mapper
public interface PositionMapper {

    /**
     * 新增职位
     */
    int insert(Position position);

    /**
     * 根据ID删除职位
     */
    int deleteById(Long id);

    /**
     * 根据ID更新职位（非空字段才更新）
     */
    int updateByIdSelective(Position position);

    /**
     * 根据ID查询职位
     */
    Position selectById(Long id);

    /**
     * 根据部门ID查询职位
     */
    List<Position> selectByDeptId(Long deptId);

    /**
     * 查询所有职位
     */
    List<Position> selectAll();

    /**
     * 校验职位名称是否已存在（同一部门下不允许重复）
     */
    int countByNameAndDept(
            @Param("positionName") String positionName,
            @Param("deptId") Long deptId,
            @Param("excludeId") Long excludeId
    );

    /**
     * 查询职位是否有关联员工
     */
    int countEmployees(Long positionId);
}