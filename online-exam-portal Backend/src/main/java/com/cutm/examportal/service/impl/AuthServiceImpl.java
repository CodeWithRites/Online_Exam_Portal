package com.cutm.examportal.service.impl;

import com.cutm.examportal.entity.Role;
import com.cutm.examportal.entity.User;
import com.cutm.examportal.repository.RoleRepository;
import com.cutm.examportal.repository.UserRepository;
import com.cutm.examportal.security.model.SignupRequest;
import com.cutm.examportal.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public ResponseEntity<?> signup(SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            return ResponseEntity.badRequest().body("❌ Username already taken");
        }

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest().body("❌ Email already in use");
        }

        Role role = roleRepository.findByName(signupRequest.getRole().getName())
                .orElseThrow(() -> new RuntimeException("❌ Role not found in DB"));

        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setUniversityId(signupRequest.getUniversityId());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setRole(role);

        userRepository.save(user);
        return ResponseEntity.ok("✅ User registered successfully!");
    }
}
