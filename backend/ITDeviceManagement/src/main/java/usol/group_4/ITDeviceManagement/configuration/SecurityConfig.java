package usol.group_4.ITDeviceManagement.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import usol.group_4.ITDeviceManagement.constant.Role;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity

public class SecurityConfig {
    @Autowired
    private CustomJwtDecoder jwtDecoder;
    private final String[] PUBLIC_ENDPOINTS = {"/api/v1/auth/login", "/api/v1/auth/refresh"};

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeRequests().antMatchers(PUBLIC_ENDPOINTS).permitAll()
                .antMatchers("/api/v1/user/myInfo", "/api/v1/user/updateProfile", "/api/v1/user/updatePassword","/api/v1/user/getRoleByUser","/api/v1/user/admins-managers", "/api/v1/auth/introspect", "/api/v1/auth/logout")
                .hasAnyRole(Role.ADMIN.name(), Role.MANAGE.name(), Role.STAFF.name())
                .antMatchers("/api/v1/categories/**")
                .hasAnyRole(Role.ADMIN.name(), Role.MANAGE.name())
                .antMatchers("/api/v1/owners/**")
                .hasAnyRole(Role.ADMIN.name(), Role.MANAGE.name())
                .antMatchers("/api/v1/devices/approve-assignment","/api/v1/devices/assignments","/api/v1/devices/assignments/reject","/api/v1/devices/assignments/return", "/api/v1/devices/{assignmentId}/download-pdf")
                .hasRole(Role.STAFF.name())
                .antMatchers("/api/v1/devices/**")
                .hasAnyRole(Role.ADMIN.name(), Role.MANAGE.name())
                .antMatchers("/api/v1/excels/**")
                .hasAnyRole(Role.ADMIN.name(), Role.MANAGE.name())
                .antMatchers("/api/v1/user/**","/api/notifications/**")
                .hasRole(Role.ADMIN.name())
//                .antMatchers("/api/v1/requests/my-requests", "/api/v1/requests/create", "/api/v1/requests/{requestId}")
//                .hasRole(Role.STAFF.name()) // Dành cho Staff
                .antMatchers("/api/v1/requests/**")
                .hasAnyRole(Role.ADMIN.name(), Role.MANAGE.name(), Role.STAFF.name()) // Dành cho Admin/Manager
                .anyRequest().authenticated().and()
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwtConfigurer -> jwtConfigurer.decoder(jwtDecoder)
                        .jwtAuthenticationConverter(jwtAuthenticationConverter())).authenticationEntryPoint(new JwtAuthenticationEntryPoint())).csrf().disable();
        return httpSecurity.build();
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");
        jwtGrantedAuthoritiesConverter.setAuthoritiesClaimName("scope");
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }
}