package com.example.hr.security;

import com.example.hr.entity.HrUser;
import com.example.hr.entity.Role;
import com.example.hr.exception.BusinessException;
import com.example.hr.exception.ErrorEnum;
import com.example.hr.mapper.UserMapper;
import com.example.hr.mapper.UserRoleMapper;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 用户详情服务：加载用户信息（用于认证）
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserMapper userMapper;
    private final UserRoleMapper userRoleMapper;
    private final RoleMapper roleMapper; // 假设存在RoleMapper

    public UserDetailsServiceImpl(UserMapper userMapper, UserRoleMapper userRoleMapper, RoleMapper roleMapper) {
        this.userMapper = userMapper;
        this.userRoleMapper = userRoleMapper;
        this.roleMapper = roleMapper;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 查询用户信息
        HrUser user = userMapper.selectByUsername(username);
        if (user == null) {
            throw new BusinessException(ErrorEnum.USER_NOT_FOUND);
        }
        if (!user.getStatus()) {
            throw new BusinessException(ErrorEnum.USER_DISABLED);
        }

        // 查询用户角色
        List<Long> roleIds = userRoleMapper.selectRoleIdsByUserId(user.getId());
        List<GrantedAuthority> authorities = new ArrayList<>();
        for (Long roleId : roleIds) {
            Role role = roleMapper.selectById(roleId);
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getRoleName())); // 角色需要以ROLE_为前缀
        }

        // 返回Spring Security的UserDetails实现（这里直接返回自定义HrUser，需让HrUser实现UserDetails）
        user.setAuthorities(authorities);
        return user;
    }
}