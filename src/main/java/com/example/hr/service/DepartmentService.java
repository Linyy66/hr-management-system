package com.example.hr.service;

import com.example.hr.dto.DepartmentAddDTO;
import com.example.hr.dto.DepartmentResponseDTO;
import com.example.hr.dto.DepartmentUpdateDTO;
import com.example.hr.vo.PageVO;

import java.util.List;

/**
 * 部门服务接口
 */
public interface DepartmentService {

    /**
     * 新增部门
     */
    void add(DepartmentAddDTO dto);

    /**
     * 根据ID删除部门
     */
    void delete(Long id);

    /**
     * 更新部门信息
     */
    void update(Long id, DepartmentUpdateDTO dto);

    /**
     * 根据ID查询部门详情
     */
    DepartmentResponseDTO getById(Long id);

    /**
     * 查询所有部门（树形结构）
     */
    List<DepartmentResponseDTO> listAll();

    /**
     * 分页查询部门
     */
    PageVO<DepartmentResponseDTO> listPage(Integer pageNum, Integer pageSize);
}