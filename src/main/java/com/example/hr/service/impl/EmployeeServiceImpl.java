package com.example.hr.service.impl;

import com.example.hr.dto.EmployeeAddDTO;
import com.example.hr.dto.EmployeeQueryDTO;
import com.example.hr.dto.EmployeeResponseDTO;
import com.example.hr.dto.EmployeeUpdateDTO;
import com.example.hr.entity.Employee;
import com.example.hr.exception.BusinessException;
import com.example.hr.exception.SystemException;
import com.example.hr.mapper.EmployeeMapper;
import com.example.hr.service.DepartmentService;
import com.example.hr.service.EmployeeService;
import com.example.hr.service.PositionService;
import com.example.hr.util.FileUploadUtils;
import com.example.hr.vo.PageVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 员工服务实现类
 */
@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeMapper employeeMapper;
    private final DepartmentService departmentService;
    private final PositionService positionService;
    private final FileUploadUtils fileUploadUtils;

    @Override
    @Transactional
    public void add(EmployeeAddDTO dto) {
        // 校验身份证号唯一性
        if (employeeMapper.countByIdCard(dto.getIdCard(), null) > 0) {
            throw BusinessException.duplicateData("身份证号已存在");
        }

        // 校验部门和职位是否存在
        validateDeptAndPosition(dto.getDeptId(), dto.getPositionId());

        // DTO转实体
        Employee employee = new Employee();
        BeanUtils.copyProperties(dto, employee);
        employee.setCreateTime(LocalDateTime.now());
        employee.setUpdateTime(LocalDateTime.now());
        employee.setCreateBy(1L); // 实际应从当前登录用户获取
        employee.setUpdateBy(1L);

        employeeMapper.insert(employee);
    }

    @Override
    @Transactional
    public void batchDelete(List<Long> ids) {
        if (ids.isEmpty()) {
            throw BusinessException.paramError("删除ID列表不能为空");
        }
        employeeMapper.batchDelete(ids);
    }

    @Override
    @Transactional
    public void update(Long id, EmployeeUpdateDTO dto) {
        Employee employee = employeeMapper.selectById(id);
        if (employee == null) {
            throw BusinessException.resourceNotFound();
        }

        // 校验身份证号唯一性（排除自身）
        if (dto.getIdCard() != null && employeeMapper.countByIdCard(dto.getIdCard(), id) > 0) {
            throw BusinessException.duplicateData("身份证号已存在");
        }

        // 校验部门和职位（如果有更新）
        if (dto.getDeptId() != null && dto.getPositionId() != null) {
            validateDeptAndPosition(dto.getDeptId(), dto.getPositionId());
        }

        // 更新字段
        BeanUtils.copyProperties(dto, employee);
        employee.setId(id);
        employee.setUpdateTime(LocalDateTime.now());
        employee.setUpdateBy(1L); // 实际应从当前登录用户获取

        employeeMapper.updateByIdSelective(employee);
    }

    @Override
    public EmployeeResponseDTO getById(Long id) {
        Employee employee = employeeMapper.selectById(id);
        if (employee == null) {
            throw BusinessException.resourceNotFound();
        }
        return convertToResponseDTO(employee);
    }

    @Override
    public PageVO<EmployeeResponseDTO> queryPage(EmployeeQueryDTO query, Integer pageNum, Integer pageSize) {
        int total = employeeMapper.countByQuery(query);
        int offset = (pageNum - 1) * pageSize;
        List<Employee> employees = employeeMapper.selectByPage(query, offset, pageSize);

        List<EmployeeResponseDTO> list = employees.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());

        return new PageVO<>(total, list);
    }

    @Override
    @Transactional
    public String uploadAvatar(Long id, MultipartFile file) {
        if (file.isEmpty()) {
            throw BusinessException.paramError("上传文件不能为空");
        }

        // 校验员工是否存在
        if (employeeMapper.selectById(id) == null) {
            throw BusinessException.resourceNotFound();
        }

        try {
            // 上传文件并获取URL
            String avatarUrl = fileUploadUtils.upload(file, "avatar");

            // 更新员工头像
            Employee employee = new Employee();
            employee.setId(id);
            employee.setAvatar(avatarUrl);
            employee.setUpdateTime(LocalDateTime.now());
            employeeMapper.updateByIdSelective(employee);

            return avatarUrl;
        } catch (Exception e) {
            throw SystemException.fileError("头像上传失败：" + e.getMessage());
        }
    }

    // 校验部门和职位是否存在
    private void validateDeptAndPosition(Long deptId, Long positionId) {
        if (departmentService.getById(deptId) == null) {
            throw BusinessException.paramError("部门不存在");
        }
        if (positionService.getById(positionId) == null) {
            throw BusinessException.paramError("职位不存在");
        }
    }

    // 实体转响应DTO
    private EmployeeResponseDTO convertToResponseDTO(Employee employee) {
        EmployeeResponseDTO responseDTO = new EmployeeResponseDTO();
        BeanUtils.copyProperties(employee, responseDTO);

        // 补充部门和职位名称
        responseDTO.setDeptName(departmentService.getById(employee.getDeptId()).getDeptName());
        responseDTO.setPositionName(positionService.getById(employee.getPositionId()).getPositionName());

        return responseDTO;
    }
}