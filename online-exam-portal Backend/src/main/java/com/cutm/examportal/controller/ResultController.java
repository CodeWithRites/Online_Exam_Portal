package com.cutm.examportal.controller;

import com.cutm.examportal.entity.*;
import com.cutm.examportal.repository.OptionRepository;
import com.cutm.examportal.repository.QuestionRepository;
import com.cutm.examportal.repository.SubmissionRepository;
import com.cutm.examportal.security.jwt.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/result")
@CrossOrigin(origins = "http://localhost:4200")
public class ResultController {

    private final SubmissionRepository submissionRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final JwtUtil jwtUtil;

    public ResultController(SubmissionRepository submissionRepository,
                            QuestionRepository questionRepository,
                            OptionRepository optionRepository,
                            JwtUtil jwtUtil) {
        this.submissionRepository = submissionRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 🧾 NEW ENDPOINT — Get current student's own exam submissions
     * Used by the frontend to restrict multiple attempts.
     */
    @GetMapping("/my-submissions")
    public ResponseEntity<?> getMySubmissions(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        // Fetch only this student's submissions
        List<Submission> submissions = submissionRepository.findByStudent_Username(username);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Submission s : submissions) {
            if (s.getExam() == null) continue;

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("submissionId", s.getId());
            entry.put("examId", s.getExam().getId());
            entry.put("examTitle", s.getExam().getTitle());
            entry.put("evaluated", s.isEvaluated());
            entry.put("submittedAt", s.getSubmittedAt());
            entry.put("marks", s.getMarks() != null ? s.getMarks() : 0);
            entry.put("studentId", s.getStudent() != null ? s.getStudent().getId() : s.getUserId());
            result.add(entry);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * List submissions for teacher evaluation.
     */
    @GetMapping("/submissions")
    public ResponseEntity<?> listSubmissions(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String username = null;
        String role = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            username = jwtUtil.extractUsername(token);
            role = jwtUtil.extractRole(token);
        }

        List<Submission> submissions;
        if (role != null && role.equalsIgnoreCase("ROLE_ADMIN")) {
            submissions = submissionRepository.findAll();
        } else if (role != null && role.toUpperCase().contains("TEACHER")) {
            submissions = submissionRepository.findByExam_CreatedBy_Username(username);
        } else if (username != null) {
            submissions = submissionRepository.findByStudent_Username(username);
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Submission s : submissions) {
            if (s.getQuizTitle() != null && !s.getQuizTitle().isEmpty()) continue;

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("id", s.getId());
            entry.put("studentName", s.getStudent() != null ? s.getStudent().getUsername() : s.getStudentName());
            entry.put("examTitle", s.getExamTitle() != null ? s.getExamTitle() : (s.getExam() != null ? s.getExam().getTitle() : "N/A"));
            entry.put("evaluated", s.isEvaluated());
            entry.put("submittedAt", s.getSubmittedAt());

            int totalMarks = 0;
            if (s.getAnswers() != null && !s.getAnswers().isEmpty()) {
                totalMarks = s.getAnswers().stream()
                        .mapToInt(a -> a.getQuestion() != null ? a.getQuestion().getMarks() : 1)
                        .sum();
            }
            int obtained = s.getMarks() != null ? s.getMarks() : 0;

            entry.put("marksObtained", obtained);
            entry.put("totalMarks", totalMarks);
            entry.put("marksDisplay", obtained + " / " + totalMarks);
            result.add(entry);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSubmission(@PathVariable Long id,
                                           @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String username = null;
        String role = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            username = jwtUtil.extractUsername(token);
            role = jwtUtil.extractRole(token);
        }

        Optional<Submission> opt = submissionRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Submission not found"));

        Submission s = opt.get();

        if (!(role != null && role.equalsIgnoreCase("ROLE_ADMIN"))) {
            if (role != null && role.toUpperCase().contains("TEACHER")) {
                boolean owns = false;
                if (s.getExam() != null && s.getExam().getCreatedBy() != null &&
                        username.equalsIgnoreCase(s.getExam().getCreatedBy().getUsername())) {
                    owns = true;
                }
                if (!owns) return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
            } else {
                if (s.getStudent() == null || username == null || !username.equalsIgnoreCase(s.getStudent().getUsername())) {
                    return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
                }
            }
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", s.getId());
        data.put("studentName", s.getStudent() != null ? s.getStudent().getUsername() : s.getStudentName());
        data.put("examTitle", s.getExamTitle() != null ? s.getExamTitle() : (s.getExam() != null ? s.getExam().getTitle() : "N/A"));
        data.put("submittedAt", s.getSubmittedAt());
        data.put("evaluated", s.isEvaluated());
        data.put("teacherComments", s.getTeacherComments());
        data.put("marks", s.getMarks() != null ? s.getMarks() : 0);

        List<Map<String, Object>> answers = new ArrayList<>();
        if (s.getAnswers() != null) {
            for (Answer a : s.getAnswers()) {
                Map<String, Object> ans = new LinkedHashMap<>();
                Question q = a.getQuestion();
                ans.put("id", a.getId());
                ans.put("questionText", q != null ? q.getQuestionText() : "N/A");
                ans.put("marks", q != null ? q.getMarks() : 1);
                ans.put("textAnswer", a.getTextAnswer());
                ans.put("filePath", a.getFilePath());
                ans.put("marksAwarded", a.getMarksAwarded() != null ? a.getMarksAwarded() : 0);
                ans.put("isCorrect", a.getIsCorrect() != null ? a.getIsCorrect() : false);
                answers.add(ans);
            }
        }

        data.put("answers", answers);
        return ResponseEntity.ok(data);
    }

    @Data
    public static class EvalRequest {
        private Map<Long, Integer> marksAwarded;
        private String comment;
    }

    @PostMapping("/evaluate/{submissionId}")
    public ResponseEntity<?> evaluateSubmission(@PathVariable Long submissionId,
                                                @RequestBody EvalRequest req,
                                                @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String username = null;
        String role = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            username = jwtUtil.extractUsername(token);
            role = jwtUtil.extractRole(token);
        }

        Optional<Submission> opt = submissionRepository.findById(submissionId);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Submission not found"));

        Submission s = opt.get();

        boolean allowed = false;
        if (role != null && role.equalsIgnoreCase("ROLE_ADMIN")) allowed = true;
        if (!allowed && role != null && role.toUpperCase().contains("TEACHER")) {
            if (s.getExam() != null && s.getExam().getCreatedBy() != null &&
                    username.equalsIgnoreCase(s.getExam().getCreatedBy().getUsername())) {
                allowed = true;
            }
        }
        if (!allowed) return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));

        if (s.getAnswers() != null && req.getMarksAwarded() != null) {
            for (Answer a : s.getAnswers()) {
                Integer marks = req.getMarksAwarded().get(a.getId());
                if (marks != null) a.setMarksAwarded(marks);
            }
        }

        s.setTeacherComments(req.getComment());
        s.setEvaluated(true);

        int total = s.getAnswers().stream()
                .mapToInt(a -> a.getMarksAwarded() != null ? a.getMarksAwarded() : 0)
                .sum();
        s.setMarks(total);

        submissionRepository.save(s);
        return ResponseEntity.ok(Map.of("message", "✅ Evaluation saved successfully!"));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteSubmission(@PathVariable Long id,
                                              @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String username = null;
        String role = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            username = jwtUtil.extractUsername(token);
            role = jwtUtil.extractRole(token);
        }

        Optional<Submission> opt = submissionRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Submission not found"));

        Submission s = opt.get();

        boolean allowed = false;
        if (role != null && role.equalsIgnoreCase("ROLE_ADMIN")) allowed = true;
        if (!allowed && role != null && role.toUpperCase().contains("TEACHER")) {
            if (s.getExam() != null && s.getExam().getCreatedBy() != null &&
                    username.equalsIgnoreCase(s.getExam().getCreatedBy().getUsername())) {
                allowed = true;
            }
        }
        if (!allowed) return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));

        submissionRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "✅ Submission deleted successfully!"));
    }

    @GetMapping("/student-performance")
    public ResponseEntity<?> getAllStudentPerformance(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String username = null;
        String role = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            username = jwtUtil.extractUsername(token);
            role = jwtUtil.extractRole(token);
        }

        List<Submission> submissions;

        if (role != null && role.equalsIgnoreCase("ROLE_ADMIN")) {
            submissions = submissionRepository.findAll();
        } else if (role != null && role.toUpperCase().contains("TEACHER")) {
            submissions = submissionRepository.findByExam_CreatedBy_Username(username);
        } else if (username != null) {
            submissions = submissionRepository.findByStudent_Username(username);
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        System.out.println("👉 Submissions count found for " + username + " = " + submissions.size());

        List<Map<String, Object>> result = new ArrayList<>();

        for (Submission s : submissions) {
            if (!s.isEvaluated()) continue;

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("studentName", s.getStudent() != null ? s.getStudent().getUsername() : s.getStudentName());

            boolean isQuiz = (s.getQuizTitle() != null && !s.getQuizTitle().isEmpty());
            entry.put("examTitle", isQuiz ? s.getQuizTitle() : (s.getExamTitle() != null ? s.getExamTitle() : (s.getExam() != null ? s.getExam().getTitle() : "N/A")));
            entry.put("type", isQuiz ? "Quiz" : "Exam");

            int obtained = 0;
            int totalMarks = 0;

            if (isQuiz) {
                if (s.getAnswers() != null && !s.getAnswers().isEmpty()) {
                    obtained = (int) s.getAnswers().stream()
                            .filter(a -> Boolean.TRUE.equals(a.getIsCorrect()))
                            .count();
                    totalMarks = s.getAnswers().size();
                }

                if (totalMarks == 0 && s.getQuizTitle() != null) {
                    List<Question> quizQuestions = questionRepository.findAll()
                            .stream()
                            .filter(q -> q.getQuiz() != null && q.getQuiz().getTitle().equalsIgnoreCase(s.getQuizTitle()))
                            .toList();
                    totalMarks = quizQuestions.size();
                }
            } else {
                if (s.getAnswers() != null && !s.getAnswers().isEmpty()) {
                    totalMarks = s.getAnswers().stream()
                            .mapToInt(a -> a.getQuestion() != null ? a.getQuestion().getMarks() : 1)
                            .sum();
                }
                obtained = s.getMarks() != null ? s.getMarks() : 0;
            }

            double percent = totalMarks > 0 ? (obtained * 100.0 / totalMarks) : 0;
            String display = obtained + " / " + totalMarks + " (" + String.format("%.1f", percent) + "%)";

            entry.put("marksObtained", obtained);
            entry.put("totalMarks", totalMarks);
            entry.put("marksDisplay", display);
            entry.put("comment", s.getTeacherComments() != null ? s.getTeacherComments() : (isQuiz ? "Auto-evaluated quiz" : "-"));
            entry.put("status", "Evaluated");

            result.add(entry);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/quiz/submit")
    @Transactional
    public ResponseEntity<?> submitQuiz(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                        @RequestBody QuizSubmissionRequest payload) {
        try {
            if (payload == null || payload.getAnswers() == null || payload.getAnswers().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No answers submitted."));
            }

            Submission submission = new Submission();
            submission.setQuizTitle(payload.getQuizTitle());
            submission.setSubmittedAt(LocalDateTime.now());
            submission.setEvaluated(true);
            submission.setTeacherComments("Auto-evaluated quiz result");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7);
                    String username = jwtUtil.extractUsername(token);
                    submission.setStudentName(payload.getStudentName() != null ? payload.getStudentName() : username);
                } catch (Exception ignored) {}
            } else {
                submission.setStudentName(payload.getStudentName());
            }

            List<Answer> answers = new ArrayList<>();
            int totalCorrect = 0;

            for (QuizAnswer qa : payload.getAnswers()) {
                Question q = questionRepository.findById(qa.getQuestionId()).orElse(null);
                boolean isCorrect = false;

                if (q != null) {
                    List<Option> correctOptions = optionRepository.findByQuestion_Id(q.getId())
                            .stream()
                            .filter(Option::isCorrect)
                            .toList();

                    for (Option opt : correctOptions) {
                        if (opt.getText().trim().equalsIgnoreCase(qa.getSelectedOption().trim())) {
                            isCorrect = true;
                            break;
                        }
                    }
                }

                Answer a = new Answer();
                a.setQuestion(q);
                a.setSubmission(submission);
                a.setTextAnswer(qa.getSelectedOption());
                a.setIsCorrect(isCorrect);
                a.setMarksAwarded(isCorrect ? (q != null ? q.getMarks() : 1) : 0);

                if (isCorrect) totalCorrect++;
                answers.add(a);
            }

            submission.setAnswers(answers);
            submission.setMarks(totalCorrect);
            submissionRepository.save(submission);

            return ResponseEntity.ok(Map.of(
                    "message", "✅ Quiz submitted successfully!",
                    "marks", totalCorrect,
                    "totalQuestions", payload.getAnswers().size(),
                    "formattedScore", totalCorrect + " / " + payload.getAnswers().size()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Quiz submission failed", "details", e.getMessage()));
        }
    }

    @Data
    public static class QuizSubmissionRequest {
        private String studentName;
        private String quizTitle;
        private List<QuizAnswer> answers;
    }

    @Data
    public static class QuizAnswer {
        private Long questionId;
        private String questionText;
        private String selectedOption;
        private boolean correct;
    }
}
