package com.example.hr.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

public class UserPrincipal implements UserDetails {
    private final String username;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean enabled;
    private final boolean isBuiltInUser; // 标记是否为内建用户

    public UserPrincipal(String username, String password, Collection<? extends GrantedAuthority> authorities, boolean enabled) {
        this(username, password, authorities, enabled, false);
    }

    public UserPrincipal(String username, String password, Collection<? extends GrantedAuthority> authorities, boolean enabled, boolean isBuiltInUser) {
        this.username = username;
        this.password = password;
        this.authorities = authorities;
        this.enabled = enabled;
        this.isBuiltInUser = isBuiltInUser;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    public boolean isBuiltInUser() {
        return isBuiltInUser;
    }
}