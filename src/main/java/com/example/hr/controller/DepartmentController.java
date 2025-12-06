package com.example.hr.controller;

import com.example.hr.dto.request.DepartmentAddRequest;
import com.example.hr.dto.request.DepartmentUpdateRequest;
import com.example.hr.dto.response.DepartmentResponse;
import com.example.hr.service.DepartmentService;
import com.example.hr.vo.ResultVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 部门控制器：处理部门CRUD接口
 */
@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController extends BaseController {

    private final DepartmentService departmentService;

    /**
     * 获取所有部门
     */
    @GetMapping
    public ResultVO<List<DepartmentResponse>> getAllDepartments() {
        List<DepartmentResponse> departments = departmentService.listAll();
        return success(departments);
    }

    /**
     * 根据ID获取部门详情
     */
    @GetMapping("/{id}")
    public ResultVO<DepartmentResponse> getDepartmentById(@PathVariable Long id) {
        DepartmentResponse department = departmentService.getById(id);
        return success(department);
    }

    /**
     * 新增部门（仅管理员）
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')") // Spring Security权限控制
    public ResultVO<Void> addDepartment(@Valid @RequestBody DepartmentAddRequest request) {
        departmentService.add(request);
        return success("部门新增成功");
    }

    /**
     * 更新部门（仅管理员）
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResultVO<Void> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentUpdateRequest request
    ) {
        departmentService.update(id, request);
        return success("部门更新成功");
    }

    /**
     * 删除部门（仅管理员）
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResultVO<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.delete(id);
        return success("部门删除成功");
    }
}