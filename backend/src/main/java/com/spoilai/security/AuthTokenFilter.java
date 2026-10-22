package com.spoilai.security;

import com.spoilai.service.DeviceService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;
    private final DeviceService deviceService;

    public AuthTokenFilter(JwtUtils jwtUtils,
                           UserDetailsServiceImpl userDetailsService,
                           @Lazy DeviceService deviceService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
        this.deviceService = deviceService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // 1. Check for standard User JWT Bearer Token
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                // 2. Check for Hardware ESP32 or IoT Device API Key Headers
                String deviceId = request.getHeader("X-Device-Id");
                String deviceKey = request.getHeader("X-Device-Key");

                if (StringUtils.hasText(deviceId) && StringUtils.hasText(deviceKey)) {
                    if (deviceService.validateDeviceKey(deviceId.trim(), deviceKey.trim())) {
                        UsernamePasswordAuthenticationToken deviceAuth =
                                new UsernamePasswordAuthenticationToken(
                                        deviceId.trim(),
                                        null,
                                        List.of(new SimpleGrantedAuthority("ROLE_DEVICE"))
                                );
                        deviceAuth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(deviceAuth);

                        deviceService.recordHeartbeat(deviceId.trim());
                        logger.debug("Successfully authenticated IoT Device: {}", deviceId);
                    } else {
                        logger.warn("Authentication failed for Device ID: {} - invalid device key", deviceId);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set security authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}
