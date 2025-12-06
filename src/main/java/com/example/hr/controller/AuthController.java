package com.example.hr.controller;

import com.example.hr.dto.request.LoginRequest;
import com.example.hr.dto.request.RegisterRequest;
import com.example.hr.dto.response.LoginResponse;
import com.example.hr.exception.BusinessException;
import com.example.hr.service.AuthService;
import com.example.hr.vo.ResultVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 认证控制器：处理登录、注册等认证相关接口
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController extends BaseController {

    private final AuthService authService;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ResultVO<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return success("登录成功", response);
    }

    /**
     * 用户注册（仅管理员可调用）
     */
    @PostMapping("/register")
    public ResultVO<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return success("注册成功");
    }

    /**
     * 刷新Token
     */
    @PostMapping("/refresh-token")
    public ResultVO<LoginResponse> refreshToken(@RequestBody String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new BusinessException(400, "刷新令牌不能为空");
        }
        LoginResponse response = authService.refreshToken(refreshToken);
        return success("令牌刷新成功", response);
    }
}