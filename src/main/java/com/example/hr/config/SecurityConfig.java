package com.example.hr.config;

import com.example.hr.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    private final CustomUserDetailsService customUserDetailsService;
    
    public SecurityConfig(@Lazy CustomUserDetailsService uds) {
        this.customUserDetailsService = uds;
    }
    
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder.userDetailsService(customUserDetailsService).passwordEncoder(passwordEncoder());
        return authBuilder.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .authorizeRequests(authorize -> authorize
                        .antMatchers("/", "/index", "/index.html", "/login.html", "/register.html", "/app/**", "/static/**", "/favicon.ico").permitAll()
                        .antMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .antMatchers("/api/auth/me").authenticated()
                        .antMatchers("/api/roles/**").hasRole("ADMIN")
                        .antMatchers("/api/users/**").hasRole("ADMIN")
                        .antMatchers("/api/org/**").hasRole("ADMIN")
                        .antMatchers("/api/positions/**").hasRole("ADMIN")
                        .antMatchers("/api/org1/**").hasAnyRole("HR_SPEC","HR_MANAGER","ADMIN")
                        .antMatchers("/api/staff/**").hasAnyRole("HR_SPEC","HR_MANAGER","ADMIN")
                        .antMatchers("/api/admin/**").hasRole("ADMIN")
                        .antMatchers("/api/hr-manager/**").hasRole("HR_MANAGER")
                        .antMatchers("/api/hr-spec/**").hasRole("HR_SPEC")
                        .antMatchers("/api/employee/**").hasRole("EMPLOYEE")
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/login.html")
                        .loginProcessingUrl("/login")
                        .defaultSuccessUrl("/index.html", true)
                        .failureUrl("/login.html?error=true")
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                        .logoutSuccessUrl("/login.html")
                        .permitAll()
                );
        return http.build();
    }
}