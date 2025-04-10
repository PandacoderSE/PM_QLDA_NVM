package usol.group_4.ITDeviceManagement.service;

import com.nimbusds.jose.JOSEException;
import usol.group_4.ITDeviceManagement.DTO.request.AuthenticationRequest;
import usol.group_4.ITDeviceManagement.DTO.request.IntrospectTokenRequest;
import usol.group_4.ITDeviceManagement.DTO.request.LogoutRequest;
import usol.group_4.ITDeviceManagement.DTO.request.RefreshToken;
import usol.group_4.ITDeviceManagement.DTO.response.AuthenticationResponse;
import usol.group_4.ITDeviceManagement.DTO.response.IntrospectTokenResponse;

import java.text.ParseException;

public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest request) ;
//    void logout(LogoutRequest request) throws JOSEException, ParseException ;
    IntrospectTokenResponse introspectResponse(IntrospectTokenRequest introspectTokenRequest) throws JOSEException, ParseException ;
    void logout(LogoutRequest request )  throws JOSEException, ParseException ;
    AuthenticationResponse refreshToken(RefreshToken request) throws ParseException, JOSEException ;
}
