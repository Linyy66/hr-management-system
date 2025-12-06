package com.example.hr.controller;

import com.example.hr.dto.request.PositionAddRequest;
import com.example.hr.dto.request.PositionUpdateRequest;
import com.example.hr.dto.response.PositionResponse;
import com.example.hr.service.PositionService;
import com.example.hr.vo.ResultVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 职位控制器：处理职位管理接口（如开发工程师、产品经理等）
 */
@RestController
@RequestMapping("/api/positions")
@RequiredArgsConstructor
public class PositionController extends BaseController {

    private final PositionService positionService;

    /**
     * 获取所有职位（按部门分组）
     */
    @GetMapping
    public ResultVO<List<PositionResponse>> getAllPositions(
            @RequestParam(required = false) Long deptId // 可选：按部门筛选
    ) {
        List<PositionResponse> positions = positionService.listByDept(deptId);
        return success(positions);
    }

    /**
     * 新增职位（仅管理员）
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResultVO<Void> addPosition(@Valid @RequestBody PositionAddRequest request) {
        positionService.add(request);
        return success("职位新增成功");
    }

    /**
     * 更新职位
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResultVO<Void> updatePosition(
            @PathVariable Long id,
            @Valid @RequestBody PositionUpdateRequest request
    ) {
        positionService.update(id, request);
        return success("职位更新成功");
    }

    /**
     * 删除职位（需确保无员工关联）
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResultVO<Void> deletePosition(@PathVariable Long id) {
        positionService.delete(id);
        return success("职位删除成功");
    }
}