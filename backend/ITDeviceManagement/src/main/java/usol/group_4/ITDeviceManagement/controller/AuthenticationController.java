package usol.group_4.ITDeviceManagement.controller;

import com.nimbusds.jose.JOSEException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import usol.group_4.ITDeviceManagement.DTO.request.*;
import usol.group_4.ITDeviceManagement.DTO.response.ApiResponse;
import usol.group_4.ITDeviceManagement.DTO.response.AuthenticationResponse;
import usol.group_4.ITDeviceManagement.DTO.response.IntrospectTokenResponse;
import usol.group_4.ITDeviceManagement.service.AuthenticationService;

import java.text.ParseException;

@RequestMapping("/api/v1/auth")
@RestController
@RequiredArgsConstructor
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .message("success")
                .success(true)
                .data(result)
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody LogoutRequest tokenRequest) throws ParseException, JOSEException {
        authenticationService.logout(tokenRequest);
        return ApiResponse.<Void>builder()
                .message("Logged out successfully")
                .success(true)
                .build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectTokenResponse> introspectToken(@RequestBody IntrospectTokenRequest introspectTokenRequest) throws ParseException, JOSEException {
        var introspectResult = authenticationService.introspectResponse(introspectTokenRequest);
        return ApiResponse.<IntrospectTokenResponse>builder()
                .message("Token introspection successful")
                .success(true)
                .data(introspectResult)
                .build();
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthenticationResponse> refreshToken(@RequestBody RefreshToken refreshTokenRequest) throws ParseException, JOSEException {
        var refreshResult = authenticationService.refreshToken(refreshTokenRequest);
        return ApiResponse.<AuthenticationResponse>builder()
                .message("Token refreshed successfully")
                .success(true)
                .data(refreshResult)
                .build();
    }
}

