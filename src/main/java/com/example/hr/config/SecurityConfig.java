package com.example.hr.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@SuppressWarnings("deprecation")
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .authorizeRequests()
                .antMatchers("/api/org1/**").hasAnyRole("HR_SPEC","HR_MANAGER","ADMIN")
                .antMatchers("/api/staff/**").hasAnyRole("HR_SPEC","HR_MANAGER","ADMIN")
                .anyRequest().authenticated()
                .and()
                .httpBasic();
        return http.build();
    }

    @Bean
    public static NoOpPasswordEncoder passwordEncoder() {
        // For minimal demo only. Replace with BCryptPasswordEncoder in real project.
        return (NoOpPasswordEncoder) NoOpPasswordEncoder.getInstance();
    }

    @Bean
    public org.springframework.security.core.userdetails.UserDetailsService userDetailsService() throws Exception {
        var uds = new org.springframework.security.provisioning.InMemoryUserDetailsManager();
        uds.createUser(org.springframework.security.core.userdetails.User.withUsername("spec")
                .password("specpass").roles("HR_SPEC").build());
        uds.createUser(org.springframework.security.core.userdetails.User.withUsername("mgr")
                .password("mgrpass").roles("HR_MANAGER").build());
        uds.createUser(org.springframework.security.core.userdetails.User.withUsername("admin")
                .password("adminpass").roles("ADMIN").build());
        return uds;
    }
}