package com.cutm.examportal.controller;

import com.cutm.examportal.entity.User;
import com.cutm.examportal.repository.UserRepository;
import com.cutm.examportal.security.jwt.JwtUtil;
import com.cutm.examportal.security.model.JwtResponse;
import com.cutm.examportal.security.model.LoginRequest;
import com.cutm.examportal.security.model.SignupRequest;
import com.cutm.examportal.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    // ✅ Sign-Up (Registration)
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signupRequest) {
        return authService.signup(signupRequest);
    }

    // ✅ Sign-In (Login)
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found in database"));

        String role = user.getRole().getName(); // e.g., ROLE_TEACHER
        String jwt = jwtUtil.generateToken(user.getUsername(), role);

        return ResponseEntity.ok(new JwtResponse(jwt, user.getUsername(), role));
    }
}
