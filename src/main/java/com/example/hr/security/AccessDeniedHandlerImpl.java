package com.example.hr.security;

import com.alibaba.fastjson.JSON;
import com.example.hr.vo.ResultVO;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.PrintWriter;

/**
 * 处理权限不足异常（403）
 */
@Component
public class AccessDeniedHandlerImpl implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        response.setContentType("application/json;charset=utf-8");
        PrintWriter out = response.getWriter();
        // 返回标准化无权限响应
        ResultVO<?> result = ResultVO.error(403, "没有权限执行此操作");
        out.write(JSON.toJSONString(result));
        out.flush();
        out.close();
    }
}