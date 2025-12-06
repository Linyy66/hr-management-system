package com.example.hr.mapper;

import com.example.hr.entity.HrJob;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 招聘岗位Mapper接口（对应XML：src/main/resources/mapper/HrJobMapper.xml）
 */
@Mapper
public interface HrJobMapper {

    /**
     * 新增招聘岗位
     */
    int insert(HrJob hrJob);

    /**
     * 根据ID删除招聘岗位
     */
    int deleteById(Long id);

    /**
     * 根据ID更新招聘岗位（非空字段才更新）
     */
    int updateByIdSelective(HrJob hrJob);

    /**
     * 根据ID查询招聘岗位
     */
    HrJob selectById(Long id);

    /**
     * 根据状态查询招聘岗位（1-招聘中，2-已关闭）
     */
    List<HrJob> selectByStatus(Integer status);

    /**
     * 根据部门ID查询招聘岗位
     */
    List<HrJob> selectByDeptId(Long deptId);

    /**
     * 分页查询所有招聘岗位
     */
    List<HrJob> selectByPage(
            @Param("offset") int offset,
            @Param("pageSize") int pageSize
    );

    /**
     * 统计招聘岗位总数（用于分页）
     */
    int countAll();
}