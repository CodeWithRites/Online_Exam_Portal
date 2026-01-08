package com.cutm.examportal.controller;

import com.cutm.examportal.entity.Answer;
import com.cutm.examportal.entity.Submission;
import com.cutm.examportal.repository.AnswerRepository;
import com.cutm.examportal.repository.SubmissionRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/answers")
@CrossOrigin(origins = "http://localhost:4200")
public class AnswerController {

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @PostMapping("/submit")
    public ResponseEntity<?> submitAnswers(
            @RequestParam("submissionId") Long submissionId,
            @RequestParam(value = "answers", required = false) String answersJson,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        try {
            Optional<Submission> optionalSubmission = submissionRepository.findById(submissionId);
            if (optionalSubmission.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Submission not found"));
            }

            Submission submission = optionalSubmission.get();

            Answer ans = new Answer();
            ans.setSubmission(submission);
            ans.setTextAnswer(answersJson);
            if (file != null && !file.isEmpty()) {
                ans.setFilePath(file.getOriginalFilename());
            }

            answerRepository.save(ans);
            return ResponseEntity.ok(Map.of("message", "✅ Answer saved successfully"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/submission/{id}")
    public ResponseEntity<List<Answer>> getAnswersBySubmission(@PathVariable Long id) {
        List<Answer> answers = answerRepository.findBySubmissionId(id);
        return ResponseEntity.ok(answers);
    }
}
