package com.cutm.examportal.controller;

import com.cutm.examportal.dto.CreateExamRequest;
import com.cutm.examportal.entity.*;
import com.cutm.examportal.repository.*;
import com.cutm.examportal.security.jwt.JwtUtil;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/exam")
@CrossOrigin(origins = "http://localhost:4200")
public class ExamController {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;
    private final AnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public ExamController(
            ExamRepository examRepository,
            QuestionRepository questionRepository,
            SubmissionRepository submissionRepository,
            AnswerRepository answerRepository,
            UserRepository userRepository,
            JwtUtil jwtUtil
    ) {
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.submissionRepository = submissionRepository;
        this.answerRepository = answerRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // ✅ CREATE EXAM (Teacher)
    @PostMapping("/create")
    public ResponseEntity<?> createExam(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody CreateExamRequest request
    ) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (request.getQuestions() == null || request.getQuestions().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "No questions found in request"));
            }

            Exam exam = new Exam();
            exam.setSubject(request.getSubject());
            exam.setTitle(request.getTitle());
            exam.setDurationMinutes(request.getDurationMinutes());
            exam.setDescription(request.getDescription());

            // Link teacher from JWT token
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtUtil.extractUsername(token);
                userRepository.findByUsername(username).ifPresent(exam::setCreatedBy);
            }

            List<Question> questions = new ArrayList<>();
            for (CreateExamRequest.QuestionDTO q : request.getQuestions()) {
                Question question = new Question();
                question.setQuestionText(q.getText());
                question.setMarks(q.getMarks());
                question.setType(q.getType() != null ? q.getType().trim() : "Other");
                question.setExam(exam);
                questions.add(question);
            }

            exam.setQuestions(questions);
            Exam savedExam = examRepository.save(exam);
            questionRepository.saveAll(questions);

            response.put("success", true);
            response.put("message", "✅ Exam created successfully!");
            response.put("examId", savedExam.getId());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "❌ Failed to create exam");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

 // ✅ DELETE EXAM (with cascade cleanup)
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteExam(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<Exam> examOpt = examRepository.findById(id);
            if (examOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "❌ Exam not found with ID: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Exam exam = examOpt.get();

            // 🧹 Step 1: Delete related submissions and their answers
            List<Submission> submissions = submissionRepository.findByExam_CreatedBy_Username(
                    exam.getCreatedBy() != null ? exam.getCreatedBy().getUsername() : null
            );

            for (Submission sub : submissions) {
                if (sub.getExam() != null && Objects.equals(sub.getExam().getId(), id)) {
                    answerRepository.deleteAll(sub.getAnswers());
                    submissionRepository.delete(sub);
                }
            }

            // 🧹 Step 2: Delete exam questions
            if (exam.getQuestions() != null && !exam.getQuestions().isEmpty()) {
                questionRepository.deleteAll(exam.getQuestions());
            }

            // 🧹 Step 3: Delete the exam itself
            examRepository.deleteById(id);

            response.put("success", true);
            response.put("message", "✅ Exam deleted successfully!");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "❌ Failed to delete exam");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    // ✅ GET EXAMS (Teacher/Admin)
    @GetMapping("/all")
    public ResponseEntity<?> getAllExams(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String username = null;
        String role = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            username = jwtUtil.extractUsername(token);
            role = jwtUtil.extractRole(token);
        }

        List<Exam> exams;
        if (role != null && role.equalsIgnoreCase("ROLE_ADMIN")) {
            exams = examRepository.findAll();
        } else if (role != null && role.toUpperCase().contains("TEACHER")) {
            exams = examRepository.findByCreatedBy_Username(username);
        } else {
            exams = Collections.emptyList();
        }

        return ResponseEntity.ok(Map.of("success", true, "data", exams));
    }

    // ✅ NEW: PUBLIC ENDPOINT (for Students)
    @GetMapping("/public/all")
    public ResponseEntity<?> getAllExamsForStudents() {
        try {
            List<Exam> exams = examRepository.findAll();
            exams.forEach(e -> {
                if (e.getQuestions() != null) e.getQuestions().size();
            });
            return ResponseEntity.ok(Map.of("success", true, "data", exams));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // ✅ GET SINGLE EXAM BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getExam(@PathVariable Long id) {
        Optional<Exam> optionalExam = examRepository.findById(id);
        if (optionalExam.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", "❌ Exam not found with ID: " + id));
        }

        Exam exam = optionalExam.get();
        if (exam.getQuestions() != null) exam.getQuestions().size();
        return ResponseEntity.ok(exam);
    }

    // ✅ FIXED SUBMIT EXAM (Student)
    @PostMapping("/submit")
    public ResponseEntity<?> submitExam(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                        @RequestBody SubmissionRequest submissionRequest) {
        try {
            Exam exam = examRepository.findById(submissionRequest.getExamId())
                    .orElseThrow(() -> new RuntimeException("Exam not found!"));

            User student;
            String username = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                username = jwtUtil.extractUsername(token);
            }

            if (username != null) {
                student = userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("Student not found!"));
            } else {
                student = userRepository.findById(submissionRequest.getStudentId())
                        .orElseThrow(() -> new RuntimeException("Student not found!"));
            }

            Submission submission = new Submission();
            submission.setExam(exam);
            submission.setStudent(student);
            submission.setStudentName(student.getUsername());
            submission.setExamTitle(exam.getTitle());
            submission.setSubmittedAt(LocalDateTime.now());
            submission.setEvaluated(false);

            submissionRepository.save(submission);

            for (AnswerDTO ans : submissionRequest.getAnswers()) {
                Question q = questionRepository.findById(ans.getQuestion().getId())
                        .orElseThrow(() -> new RuntimeException("Question not found!"));

                Answer a = new Answer();
                a.setTextAnswer(ans.getTextAnswer());
                a.setFilePath(ans.getFilePath());
                a.setMarksAwarded(0);
                a.setIsCorrect(false);
                a.setQuestion(q);
                a.setSubmission(submission);
                answerRepository.save(a);
            }

            return ResponseEntity.ok(Map.of("message", "✅ Exam submitted successfully!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }


    // ✅ INNER CLASSES
    @Data
    public static class SubmissionRequest {
        private Long studentId;
        private Long examId;
        private List<AnswerDTO> answers;
    }

    @Data
    public static class AnswerDTO {
        private String textAnswer;
        private String filePath;
        private QuestionDTO question;
    }

    @Data
    public static class QuestionDTO {
        private Long id;
    }
}
