package com.cutm.examportal.controller;

import com.cutm.examportal.entity.Pyq;
import com.cutm.examportal.repository.PyqRepository;
import com.cutm.examportal.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/pyq")
@CrossOrigin(origins = "http://localhost:4200")
public class PyqController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private PyqRepository pyqRepository;

    private final Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();

    /**
     * ✅ Upload PYQ (PDF + subject + year)
     */
    @PostMapping("/upload")
    public ResponseEntity<String> uploadPyq(
            @RequestParam("file") MultipartFile file,
            @RequestParam("subject") String subject,
            @RequestParam("year") int year) {

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("❌ Please select a valid file.");
            }

            // Save file physically
            String storedFileName = fileStorageService.storeFile(file);

            // Save record in DB
            Pyq pyq = new Pyq();
            pyq.setSubject(subject);
            pyq.setYear(year);
            pyq.setFileName(storedFileName);
            pyqRepository.save(pyq);

            return ResponseEntity.ok("✅ File uploaded successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Upload failed: " + e.getMessage());
        }
    }

    /**
     * ✅ Fetch all uploaded PYQs
     */
    @GetMapping("/all")
    public ResponseEntity<List<Pyq>> getAllPyqs() {
        try {
            List<Pyq> pyqs = pyqRepository.findAll();
            return ResponseEntity.ok(pyqs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * ✅ Download a specific PYQ file
     */
    @GetMapping("/download/{fileName}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            Path filePath = uploadDir.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * ✅ Delete a PYQ (Admin only)
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deletePyq(@PathVariable Long id) {
        try {
            Pyq pyq = pyqRepository.findById(id).orElse(null);
            if (pyq == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("❌ PYQ not found with ID: " + id);
            }

            // Delete physical file if it exists
            Path filePath = Paths.get("uploads").resolve(pyq.getFileName()).normalize();
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }

            // Delete from database
            pyqRepository.delete(pyq);

            return ResponseEntity.ok("✅ PYQ deleted successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Error deleting PYQ: " + e.getMessage());
        }
    }

}
