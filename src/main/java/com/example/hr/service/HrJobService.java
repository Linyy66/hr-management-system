package com.example.hr.service;

import com.example.hr.dto.JobAddRequest;
import com.example.hr.dto.JobResponse;
import com.example.hr.dto.JobUpdateRequest;
import com.example.hr.vo.PageVO;

import java.util.List;

/**
 * 招聘岗位服务接口
 */
public interface HrJobService {

    /**
     * 新增招聘岗位
     */
    void add(JobAddRequest request);

    /**
     * 更新招聘岗位
     */
    void update(Long id, JobUpdateRequest request);

    /**
     * 关闭招聘岗位
     */
    void close(Long id);

    /**
     * 根据ID查询岗位详情
     */
    JobResponse getById(Long id);

    /**
     * 根据状态查询岗位列表
     */
    List<JobResponse> listAll(Integer status);

    /**
     * 分页查询岗位
     */
    PageVO<JobResponse> listPage(Integer pageNum, Integer pageSize);
}