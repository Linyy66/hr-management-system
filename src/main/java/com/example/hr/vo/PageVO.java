package com.example.hr.vo;

import lombok.Data;
import java.util.List;

/**
 * 通用分页VO（适配前端分页组件）
 */
@Data
public class PageVO<T> {
    /** 当前页码 */
    private Integer pageNum;
    /** 每页条数 */
    private Integer pageSize;
    /** 总条数 */
    private Long total;
    /** 总页数 */
    private Integer pages;
    /** 分页数据列表 */
    private List<T> list;

    /** 快速构建分页VO */
    public static <T> PageVO<T> build(Integer pageNum, Integer pageSize, Long total, List<T> list) {
        PageVO<T> pageVO = new PageVO<>();
        pageVO.setPageNum(pageNum);
        pageVO.setPageSize(pageSize);
        pageVO.setTotal(total);
        pageVO.setPages(total == 0 ? 0 : (int) (total + pageSize - 1) / pageSize);
        pageVO.setList(list);
        return pageVO;
    }
}