package com.example.hr.service;

import com.example.hr.dto.EmployeeAddDTO;
import com.example.hr.dto.EmployeeQueryDTO;
import com.example.hr.dto.EmployeeResponseDTO;
import com.example.hr.dto.EmployeeUpdateDTO;
import com.example.hr.vo.PageVO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 员工服务接口
 */
public interface EmployeeService {

    /**
     * 新增员工
     */
    void add(EmployeeAddDTO dto);

    /**
     * 批量删除员工
     */
    void batchDelete(List<Long> ids);

    /**
     * 更新员工信息
     */
    void update(Long id, EmployeeUpdateDTO dto);

    /**
     * 根据ID查询员工详情
     */
    EmployeeResponseDTO getById(Long id);

    /**
     * 分页查询员工
     */
    PageVO<EmployeeResponseDTO> queryPage(EmployeeQueryDTO query, Integer pageNum, Integer pageSize);

    /**
     * 上传员工头像
     */
    String uploadAvatar(Long id, MultipartFile file);
}