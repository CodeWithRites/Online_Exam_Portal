package com.cutm.examportal.service;

import com.cutm.examportal.security.model.SignupRequest;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    ResponseEntity<?> signup(SignupRequest signupRequest);
}
	