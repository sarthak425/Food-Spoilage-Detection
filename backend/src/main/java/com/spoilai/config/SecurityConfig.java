package com.spoilai.config;

import com.spoilai.security.AuthEntryPointJwt;
import com.spoilai.security.AuthTokenFilter;
import com.spoilai.security.UserDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final AuthEntryPointJwt unauthorizedHandler;
    private final AuthTokenFilter authTokenFilter;
    private final PasswordEncoder passwordEncoder;

    public SecurityConfig(UserDetailsServiceImpl userDetailsService,
                          AuthEntryPointJwt unauthorizedHandler,
                          AuthTokenFilter authTokenFilter,
                          PasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.unauthorizedHandler = unauthorizedHandler;
        this.authTokenFilter = authTokenFilter;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Device-Id", "X-Device-Key", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));
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
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public auth endpoints (login, register)
                .requestMatchers("/api/auth/**").permitAll()
                // Public OpenAPI / Swagger documentation
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/api-docs/**").permitAll()
                // WebSocket STOMP handshake
                .requestMatchers("/ws-sensor/**").permitAll()
                // Uploaded static food images preview
                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                // Sensor Ingestion endpoint: Requires either authenticated Device (ESP32) or authenticated User (Simulator)
                .requestMatchers(HttpMethod.POST, "/api/sensors/readings").hasAnyRole("DEVICE", "USER", "ADMIN")

                // Telemetry history and queries: Require authenticated user
                .requestMatchers("/api/sensors/**").hasAnyRole("USER", "ADMIN")

                // Device management: Require authenticated user
                .requestMatchers("/api/devices/**").hasAnyRole("USER", "ADMIN")

                // Actuator controls: Require authenticated user
                .requestMatchers("/api/actuators/**").hasAnyRole("USER", "ADMIN")

                // Food samples: Require authenticated user
                .requestMatchers("/api/food-samples/**").hasAnyRole("USER", "ADMIN")

                // Alerts: Require authenticated user
                .requestMatchers("/api/alerts/**").hasAnyRole("USER", "ADMIN")

                // Simulator control: Require authenticated user
                .requestMatchers("/api/simulator/**").hasAnyRole("USER", "ADMIN")

                // Dashboard summary: Require authenticated user
                .requestMatchers("/api/dashboard/**").hasAnyRole("USER", "ADMIN")

                // AI intelligence services: Require authenticated user
                .requestMatchers("/api/ai/**").hasAnyRole("USER", "ADMIN")

                // All other endpoints require authentication
                .anyRequest().authenticated()
            );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
