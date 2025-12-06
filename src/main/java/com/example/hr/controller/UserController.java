package com.example.hr.controller;

import com.example.hr.dto.request.UserPasswordUpdateRequest;
import com.example.hr.dto.request.UserUpdateRequest;
import com.example.hr.dto.response.UserResponse;
import com.example.hr.service.UserService;
import com.example.hr.vo.ResultVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 用户控制器：处理系统用户管理接口
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController extends BaseController {

    private final UserService userService;

    /**
     * 获取当前登录用户信息
     */
    @GetMapping("/current")
    public ResultVO<UserResponse> getCurrentUser(Authentication authentication) {
        // authentication.getName() 为登录用户名
        UserResponse user = userService.getByUsername(authentication.getName());
        return success(user);
    }

    /**
     * 更新个人信息（仅本人）
     */
    @PutMapping("/current")
    public ResultVO<Void> updateCurrentUser(
            Authentication authentication,
            @Valid @RequestBody UserUpdateRequest request
    ) {
        userService.updateByUsername(authentication.getName(), request);
        return success("个人信息更新成功");
    }

    /**
     * 修改密码（需验证旧密码）
     */
    @PostMapping("/current/password")
    public ResultVO<Void> updatePassword(
            Authentication authentication,
            @Valid @RequestBody UserPasswordUpdateRequest request
    ) {
        userService.updatePassword(authentication.getName(), request);
        return success("密码修改成功，请重新登录");
    }

    /**
     * 管理员获取所有用户（分页）
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResultVO<?> getAllUsers(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize
    ) {
        return success(userService.listPage(pageNum, pageSize));
    }

    /**
     * 管理员禁用用户
     */
    @PatchMapping("/{id}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResultVO<Void> disableUser(@PathVariable Long id) {
        userService.disable(id);
        return success("用户已禁用");
    }
}