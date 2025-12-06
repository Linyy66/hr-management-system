package com.example.hr.service;

import com.example.hr.dto.PositionAddRequest;
import com.example.hr.dto.PositionResponse;
import com.example.hr.dto.PositionUpdateRequest;

import java.util.List;

/**
 * 职位服务接口
 */
public interface PositionService {

    /**
     * 新增职位
     */
    void add(PositionAddRequest request);

    /**
     * 根据ID删除职位
     */
    void delete(Long id);

    /**
     * 更新职位信息
     */
    void update(Long id, PositionUpdateRequest request);

    /**
     * 根据ID查询职位详情
     */
    PositionResponse getById(Long id);

    /**
     * 根据部门ID查询职位列表
     */
    List<PositionResponse> listByDept(Long deptId);
}