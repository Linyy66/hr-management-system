package com.example.hr.service.impl;

import com.example.hr.dto.JobAddRequest;
import com.example.hr.dto.JobResponse;
import com.example.hr.dto.JobUpdateRequest;
import com.example.hr.entity.HrJob;
import com.example.hr.exception.BusinessException;
import com.example.hr.mapper.HrJobMapper;
import com.example.hr.service.DepartmentService;
import com.example.hr.service.HrJobService;
import com.example.hr.vo.PageVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 招聘岗位服务实现类
 */
@Service
@RequiredArgsConstructor
public class HrJobServiceImpl implements HrJobService {

    private final HrJobMapper hrJobMapper;
    private final DepartmentService departmentService;

    @Override
    @Transactional
    public void add(JobAddRequest request) {
        // 校验部门是否存在
        if (departmentService.getById(request.getDeptId()) == null) {
            throw BusinessException.paramError("部门不存在");
        }

        // DTO转实体
        HrJob hrJob = new HrJob();
        BeanUtils.copyProperties(request, hrJob);
        hrJob.setStatus(1); // 默认为"招聘中"
        hrJob.setCreateTime(LocalDateTime.now());
        hrJob.setUpdateTime(LocalDateTime.now());
        hrJob.setCreateBy(1L); // 实际应从当前登录用户获取
        hrJob.setUpdateBy(1L);

        hrJobMapper.insert(hrJob);
    }

    @Override
    @Transactional
    public void update(Long id, JobUpdateRequest request) {
        HrJob hrJob = hrJobMapper.selectById(id);
        if (hrJob == null) {
            throw BusinessException.resourceNotFound();
        }

        // 校验部门是否存在（如果有更新）
        if (request.getDeptId() != null && departmentService.getById(request.getDeptId()) == null) {
            throw BusinessException.paramError("部门不存在");
        }

        // 更新字段
        BeanUtils.copyProperties(request, hrJob);
        hrJob.setId(id);
        hrJob.setUpdateTime(LocalDateTime.now());
        hrJob.setUpdateBy(1L); // 实际应从当前登录用户获取

        hrJobMapper.updateByIdSelective(hrJob);
    }

    @Override
    @Transactional
    public void close(Long id) {
        HrJob hrJob = hrJobMapper.selectById(id);
        if (hrJob == null) {
            throw BusinessException.resourceNotFound();
        }

        if (hrJob.getStatus() == 2) {
            throw new BusinessException(605, "该岗位已关闭招聘");
        }

        // 更新状态为"已关闭"
        hrJob.setStatus(2);
        hrJob.setUpdateTime(LocalDateTime.now());
        hrJobMapper.updateByIdSelective(hrJob);
    }

    @Override
    public JobResponse getById(Long id) {
        HrJob hrJob = hrJobMapper.selectById(id);
        if (hrJob == null) {
            throw BusinessException.resourceNotFound();
        }
        return convertToResponse(hrJob);
    }

    @Override
    public List<JobResponse> listAll(Integer status) {
        List<HrJob> jobs = hrJobMapper.selectByStatus(status);
        return jobs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PageVO<JobResponse> listPage(Integer pageNum, Integer pageSize) {
        int total = hrJobMapper.countAll();
        int offset = (pageNum - 1) * pageSize;
        List<HrJob> jobs = hrJobMapper.selectByPage(offset, pageSize);

        List<JobResponse> list = jobs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return new PageVO<>(total, list);
    }

    // 实体转响应DTO
    private JobResponse convertToResponse(HrJob hrJob) {
        JobResponse response = new JobResponse();
        BeanUtils.copyProperties(hrJob, response);

        // 补充部门名称
        response.setDeptName(departmentService.getById(hrJob.getDeptId()).getDeptName());

        // 转换状态文本
        response.setStatusText(hrJob.getStatus() == 1 ? "招聘中" : "已关闭");

        return response;
    }
}