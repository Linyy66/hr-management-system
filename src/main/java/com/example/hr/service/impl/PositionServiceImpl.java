package com.example.hr.service.impl;

import com.example.hr.dto.PositionAddRequest;
import com.example.hr.dto.PositionResponse;
import com.example.hr.dto.PositionUpdateRequest;
import com.example.hr.entity.Position;
import com.example.hr.exception.BusinessException;
import com.example.hr.mapper.EmployeeMapper;
import com.example.hr.mapper.PositionMapper;
import com.example.hr.service.DepartmentService;
import com.example.hr.service.PositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 职位服务实现类
 */
@Service
@RequiredArgsConstructor
public class PositionServiceImpl implements PositionService {

    private final PositionMapper positionMapper;
    private final DepartmentService departmentService;
    private final EmployeeMapper employeeMapper; // 用于校验职位是否关联员工

    @Override
    @Transactional
    public void add(PositionAddRequest request) {
        // 校验部门是否存在
        if (departmentService.getById(request.getDeptId()) == null) {
            throw BusinessException.paramError("部门不存在");
        }

        // 校验同部门下职位名称是否重复
        if (positionMapper.countByNameAndDept(request.getPositionName(), request.getDeptId(), null) > 0) {
            throw BusinessException.duplicateData("该部门下已存在同名职位");
        }

        // DTO转实体
        Position position = new Position();
        BeanUtils.copyProperties(request, position);
        position.setCreateTime(LocalDateTime.now());
        position.setUpdateTime(LocalDateTime.now());
        position.setCreateBy(1L); // 实际应从当前登录用户获取
        position.setUpdateBy(1L);

        positionMapper.insert(position);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Position position = positionMapper.selectById(id);
        if (position == null) {
            throw BusinessException.resourceNotFound();
        }

        // 校验职位是否关联员工
        if (employeeMapper.countByPositionId(id) > 0) { // 需在EmployeeMapper中实现
            throw new BusinessException(602, "该职位关联员工，无法删除");
        }

        positionMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void update(Long id, PositionUpdateRequest request) {
        Position position = positionMapper.selectById(id);
        if (position == null) {
            throw BusinessException.resourceNotFound();
        }

        // 校验部门是否存在（如果有更新）
        if (request.getDeptId() != null && departmentService.getById(request.getDeptId()) == null) {
            throw BusinessException.paramError("部门不存在");
        }

        // 校验同部门下职位名称是否重复（排除自身）
        Long deptId = request.getDeptId() != null ? request.getDeptId() : position.getDeptId();
        String positionName = request.getPositionName();
        if (positionName != null && positionMapper.countByNameAndDept(positionName, deptId, id) > 0) {
            throw BusinessException.duplicateData("该部门下已存在同名职位");
        }

        // 更新字段
        BeanUtils.copyProperties(request, position);
        position.setId(id);
        position.setUpdateTime(LocalDateTime.now());
        position.setUpdateBy(1L); // 实际应从当前登录用户获取

        positionMapper.updateByIdSelective(position);
    }

    @Override
    public PositionResponse getById(Long id) {
        Position position = positionMapper.selectById(id);
        if (position == null) {
            throw BusinessException.resourceNotFound();
        }
        return convertToResponse(position);
    }

    @Override
    public List<PositionResponse> listByDept(Long deptId) {
        List<Position> positions = positionMapper.selectByDeptId(deptId);
        return positions.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 实体转响应DTO
    private PositionResponse convertToResponse(Position position) {
        PositionResponse response = new PositionResponse();
        BeanUtils.copyProperties(position, response);

        // 补充部门名称
        response.setDeptName(departmentService.getById(position.getDeptId()).getDeptName());

        return response;
    }
}