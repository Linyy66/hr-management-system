package com.example.hr.mapper;

import com.example.hr.entity.HrUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 系统用户Mapper接口（对应XML：src/main/resources/mapper/UserMapper.xml）
 */
@Mapper
public interface UserMapper {

    /**
     * 新增用户
     */
    int insert(HrUser user);

    /**
     * 根据ID删除用户
     */
    int deleteById(Long id);

    /**
     * 根据ID更新用户（非空字段才更新）
     */
    int updateByIdSelective(HrUser user);

    /**
     * 根据ID查询用户
     */
    HrUser selectById(Long id);

    /**
     * 根据用户名查询用户（用于登录）
     */
    HrUser selectByUsername(String username);

    /**
     * 分页查询用户
     */
    List<HrUser> selectByPage(
            @Param("offset") int offset,
            @Param("pageSize") int pageSize
    );

    /**
     * 统计用户总数（用于分页）
     */
    int countAll();

    /**
     * 校验用户名是否已存在（排除自身ID）
     */
    int countByUsername(@Param("username") String username, @Param("excludeId") Long excludeId);

    /**
     * 更新用户最后登录时间
     */
    int updateLastLoginTime(@Param("id") Long id, @Param("lastLoginTime") String lastLoginTime);
}