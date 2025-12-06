package com.example.hr.controller;

import com.example.hr.dto.request.JobAddRequest;
import com.example.hr.dto.request.JobUpdateRequest;
import com.example.hr.dto.response.JobResponse;
import com.example.hr.service.HrJobService;
import com.example.hr.vo.ResultVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 招聘岗位控制器：处理岗位管理接口
 */
@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class HrJobController extends BaseController {

    private final HrJobService hrJobService;

    /**
     * 获取所有招聘岗位
     */
    @GetMapping
    public ResultVO<List<JobResponse>> getAllJobs(
            @RequestParam(required = false) Integer status // 1-招聘中 2-已关闭
    ) {
        List<JobResponse> jobs = hrJobService.listAll(status);
        return success(jobs);
    }

    /**
     * 根据ID获取岗位详情
     */
    @GetMapping("/{id}")
    public ResultVO<JobResponse> getJobById(@PathVariable Long id) {
        JobResponse job = hrJobService.getById(id);
        return success(job);
    }

    /**
     * 新增招聘岗位（仅HR/管理员）
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResultVO<Void> addJob(@Valid @RequestBody JobAddRequest request) {
        hrJobService.add(request);
        return success("岗位新增成功");
    }

    /**
     * 更新岗位信息
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResultVO<Void> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobUpdateRequest request
    ) {
        hrJobService.update(id, request);
        return success("岗位更新成功");
    }

    /**
     * 关闭招聘岗位
     */
    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResultVO<Void> closeJob(@PathVariable Long id) {
        hrJobService.close(id);
        return success("岗位已关闭招聘");
    }
}