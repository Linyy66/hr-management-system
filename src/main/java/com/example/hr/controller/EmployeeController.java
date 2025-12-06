package com.example.hr.controller;

import com.example.hr.dto.request.EmployeeAddRequest;
import com.example.hr.dto.request.EmployeeQueryRequest;
import com.example.hr.dto.request.EmployeeUpdateRequest;
import com.example.hr.dto.response.EmployeeResponse;
import com.example.hr.dto.response.PageResponse;
import com.example.hr.service.EmployeeService;
import com.example.hr.vo.ResultVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 员工控制器：处理员工管理接口
 */
@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController extends BaseController {

    private final EmployeeService employeeService;

    /**
     * 分页查询员工
     */
    @GetMapping
    public ResultVO<PageResponse<EmployeeResponse>> queryEmployees(
            @Valid EmployeeQueryRequest query,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize
    ) {
        PageResponse<EmployeeResponse> page = employeeService.queryPage(query, pageNum, pageSize);
        return success(page);
    }

    /**
     * 根据ID获取员工详情
     */
    @GetMapping("/{id}")
    public ResultVO<EmployeeResponse> getEmployeeById(@PathVariable Long id) {
        EmployeeResponse employee = employeeService.getById(id);
        return success(employee);
    }

    /**
     * 新增员工（仅管理员/HR）
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResultVO<Void> addEmployee(@Valid @RequestBody EmployeeAddRequest request) {
        employeeService.add(request);
        return success("员工新增成功");
    }

    /**
     * 更新员工信息
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityService.isSelf(authentication, #id)")
    public ResultVO<Void> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeUpdateRequest request
    ) {
        employeeService.update(id, request);
        return success("员工信息更新成功");
    }

    /**
     * 上传员工头像
     */
    @PostMapping("/{id}/avatar")
    public ResultVO<String> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        String avatarUrl = employeeService.uploadAvatar(id, file);
        return success("头像上传成功", avatarUrl);
    }

    /**
     * 批量删除员工（仅管理员）
     */
    @DeleteMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResultVO<Void> batchDelete(@RequestBody List<Long> ids) {
        employeeService.batchDelete(ids);
        return success("员工批量删除成功");
    }
}