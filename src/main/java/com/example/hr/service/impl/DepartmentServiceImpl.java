package com.example.hr.service.impl;

import com.example.hr.dto.DepartmentAddDTO;
import com.example.hr.dto.DepartmentResponseDTO;
import com.example.hr.dto.DepartmentUpdateDTO;
import com.example.hr.entity.Department;
import com.example.hr.exception.BusinessException;
import com.example.hr.mapper.DepartmentMapper;
import com.example.hr.service.DepartmentService;
import com.example.hr.vo.PageVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 部门服务实现类
 */
@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentMapper departmentMapper;

    @Override
    @Transactional
    public void add(DepartmentAddDTO dto) {
        // 校验部门名称唯一性
        if (departmentMapper.countByName(dto.getDeptName(), null) > 0) {
            throw BusinessException.duplicateData("部门名称已存在");
        }

        // DTO转实体
        Department department = new Department();
        BeanUtils.copyProperties(dto, department);
        department.setCreateTime(LocalDateTime.now());
        department.setUpdateTime(LocalDateTime.now());
        department.setCreateBy(1L); // 实际应从当前登录用户获取
        department.setUpdateBy(1L);

        departmentMapper.insert(department);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        // 校验部门是否存在
        Department department = departmentMapper.selectById(id);
        if (department == null) {
            throw BusinessException.resourceNotFound();
        }

        // 校验是否存在子部门
        if (departmentMapper.countChildren(id) > 0) {
            throw new BusinessException(602, "该部门存在子部门，无法删除");
        }

        departmentMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void update(Long id, DepartmentUpdateDTO dto) {
        Department department = departmentMapper.selectById(id);
        if (department == null) {
            throw BusinessException.resourceNotFound();
        }

        // 校验部门名称唯一性（排除自身）
        if (dto.getDeptName() != null && departmentMapper.countByName(dto.getDeptName(), id) > 0) {
            throw BusinessException.duplicateData("部门名称已存在");
        }

        // 更新字段
        BeanUtils.copyProperties(dto, department);
        department.setId(id);
        department.setUpdateTime(LocalDateTime.now());
        department.setUpdateBy(1L); // 实际应从当前登录用户获取

        departmentMapper.updateByIdSelective(department);
    }

    @Override
    public DepartmentResponseDTO getById(Long id) {
        Department department = departmentMapper.selectById(id);
        if (department == null) {
            throw BusinessException.resourceNotFound();
        }
        return convertToResponseDTO(department);
    }

    @Override
    public List<DepartmentResponseDTO> listAll() {
        List<Department> departments = departmentMapper.selectAll();
        // 构建树形结构
        return buildDeptTree(departments, null);
    }

    @Override
    public PageVO<DepartmentResponseDTO> listPage(Integer pageNum, Integer pageSize) {
        int total = departmentMapper.countAll(); // 需在Mapper中实现countAll方法
        int offset = (pageNum - 1) * pageSize;
        List<Department> departments = departmentMapper.selectByPage(offset, pageSize); // 需在Mapper中实现

        List<DepartmentResponseDTO> list = departments.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());

        return new PageVO<>(total, list);
    }

    // 实体转响应DTO
    private DepartmentResponseDTO convertToResponseDTO(Department department) {
        DepartmentResponseDTO responseDTO = new DepartmentResponseDTO();
        BeanUtils.copyProperties(department, responseDTO);

        // 补充父部门名称
        if (department.getParentId() != null) {
            Department parent = departmentMapper.selectById(department.getParentId());
            if (parent != null) {
                responseDTO.setParentName(parent.getDeptName());
            }
        }
        return responseDTO;
    }

    // 构建部门树形结构
    private List<DepartmentResponseDTO> buildDeptTree(List<Department> departments, Long parentId) {
        return departments.stream()
                .filter(dept -> parentId == null ? dept.getParentId() == null : parentId.equals(dept.getParentId()))
                .map(dept -> {
                    DepartmentResponseDTO dto = convertToResponseDTO(dept);
                    // 递归设置子部门
                    dto.setChildren(buildDeptTree(departments, dept.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }
}