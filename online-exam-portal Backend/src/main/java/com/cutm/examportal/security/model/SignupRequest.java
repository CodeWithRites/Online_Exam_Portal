package com.cutm.examportal.security.model;

import com.cutm.examportal.entity.Role;

public class SignupRequest {
    private String username;
    private String password;
    private String email;
    private String universityId;
    private Role role; // ✅ Must be Role, not String

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUniversityId() { return universityId; }
    public void setUniversityId(String universityId) { this.universityId = universityId; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
