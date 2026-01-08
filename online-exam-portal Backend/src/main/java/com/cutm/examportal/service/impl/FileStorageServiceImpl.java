package com.cutm.examportal.service.impl;

import com.cutm.examportal.service.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service // ✅ This annotation is mandatory
public class FileStorageServiceImpl implements FileStorageService {

    private final Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();

    public FileStorageServiceImpl() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create uploads directory", e);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty or null");
        }

        try {
            String original = Paths.get(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename()).getFileName().toString();
            String ext = "";
            int i = original.lastIndexOf('.');
            if (i >= 0) ext = original.substring(i);

            String storedFileName = UUID.randomUUID() + ext;
            Path target = uploadDir.resolve(storedFileName).normalize();

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return storedFileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }
}
