package com.cutm.examportal.controller;

import com.cutm.examportal.entity.Answer;
import com.cutm.examportal.entity.Submission;
import com.cutm.examportal.entity.User;
import com.cutm.examportal.repository.AnswerRepository;
import com.cutm.examportal.repository.SubmissionRepository;
import com.cutm.examportal.repository.UserRepository;
import com.cutm.examportal.security.jwt.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "http://localhost:4200")
public class SubmissionController {

    private final SubmissionRepository submissionRepository;
    private final AnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public SubmissionController(SubmissionRepository submissionRepository,
                                AnswerRepository answerRepository,
                                UserRepository userRepository,
                                JwtUtil jwtUtil) {
        this.submissionRepository = submissionRepository;
        this.answerRepository = answerRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Save a new student submission.
     * If Authorization Bearer token is present, link Submission.student to the authenticated user.
     * Frontend may still pass userId/userName, but we prefer token user.
     */
    @PostMapping("/save")
    public ResponseEntity<?> saveSubmission(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                            @RequestBody Map<String, Object> payload) {
        try {
            Submission submission = new Submission();

            // set common fields (examTitle, studentName, etc.)
            if (payload.get("examTitle") != null) submission.setExamTitle(payload.get("examTitle").toString());
            if (payload.get("quizTitle") != null) submission.setQuizTitle(payload.get("quizTitle").toString());
            if (payload.get("studentName") != null) submission.setStudentName(payload.get("studentName").toString());

            submission.setEvaluated(false);
            submission.setSubmittedAt(LocalDateTime.now());

            // if token present, attach the student user
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7);
                    String username = jwtUtil.extractUsername(token);
                    Optional<User> uOpt = userRepository.findByUsername(username);
                    uOpt.ifPresent(submission::setStudent);
                    // also keep userName/userId mirror fields if provided
                    if (submission.getStudent() != null) {
                        submission.setUserName(submission.getStudent().getUsername());
                        submission.setUserId(submission.getStudent().getId());
                    }
                } catch (Exception ex) {
                    // ignore - token might be invalid; continue saving without linking
                    ex.printStackTrace();
                }
            } else {
                // fallback to payload-provided userId/userName (legacy)
                if (payload.get("userId") != null) {
                    try { submission.setUserId(Long.valueOf(payload.get("userId").toString())); } catch (Exception ignored) {}
                }
                if (payload.get("userName") != null) submission.setUserName(payload.get("userName").toString());
            }

            Submission savedSubmission = submissionRepository.save(submission);

            // save answers from payload.answers
            List<Map<String, Object>> answers = (List<Map<String, Object>>) payload.get("answers");
            if (answers != null) {
                for (Map<String, Object> a : answers) {
                    Answer answer = new Answer();
                    if (a.get("textAnswer") != null) answer.setTextAnswer(a.get("textAnswer").toString());
                    if (a.get("filePath") != null) answer.setFilePath(a.get("filePath").toString());
                    if (a.get("marks") != null) {
                        try { answer.setMarksAwarded(Integer.parseInt(a.get("marks").toString())); } catch (Exception ignored) {}
                    }
                    // If payload contains question id, you may want to attach question reference here.
                    answer.setSubmission(savedSubmission);
                    answerRepository.save(answer);
                }
            }

            return ResponseEntity.ok(Map.of("message", "✅ Submission saved successfully!", "submissionId", savedSubmission.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Submission>> getAllSubmissions() {
        return ResponseEntity.ok(submissionRepository.findAll());
    }

    @GetMapping("/{id}/answers")
    public ResponseEntity<List<Answer>> getAnswersBySubmission(@PathVariable Long id) {
        return ResponseEntity.ok(answerRepository.findBySubmissionId(id));
    }
}
