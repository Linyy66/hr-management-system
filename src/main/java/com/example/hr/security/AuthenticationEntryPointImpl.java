package com.example.hr.security;

import com.alibaba.fastjson.JSON;
import com.example.hr.vo.ResultVO;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.PrintWriter;

/**
 * 处理未认证异常（401）
 */
@Component
public class AuthenticationEntryPointImpl implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        response.setContentType("application/json;charset=utf-8");
        PrintWriter out = response.getWriter();
        // 返回标准化未登录响应
        ResultVO<?> result = ResultVO.error(401, "未登录或登录已过期，请重新登录");
        out.write(JSON.toJSONString(result));
        out.flush();
        out.close();
    }
}