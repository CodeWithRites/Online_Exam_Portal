package com.cutm.examportal;

import com.cutm.examportal.entity.Role;
import com.cutm.examportal.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication  // ✅ Enables component scanning for all sub-packages
public class OnlineExamPortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(OnlineExamPortalApplication.class, args);
    }

    // ✅ This runs automatically when the application starts
    @Bean
    CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            String[] roles = {"ROLE_ADMIN", "ROLE_TEACHER", "ROLE_STUDENT"};

            for (String name : roles) {
                // Check if role already exists, otherwise create it
                roleRepository.findByName(name).orElseGet(() -> {
                    Role r = new Role();
                    r.setName(name);
                    System.out.println("🆕 Creating role: " + name);
                    return roleRepository.save(r);
                });
            }

            System.out.println("✅ All default roles verified or created successfully!");
        };
    }
}
