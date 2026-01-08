package com.cutm.examportal.controller;

import com.cutm.examportal.entity.*;
import com.cutm.examportal.repository.*;
import com.cutm.examportal.security.jwt.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:4200")
public class QuizController {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final SubmissionRepository submissionRepository;
    private final AnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public QuizController(QuizRepository quizRepository,
                          QuestionRepository questionRepository,
                          OptionRepository optionRepository,
                          SubmissionRepository submissionRepository,
                          AnswerRepository answerRepository,
                          UserRepository userRepository,
                          JwtUtil jwtUtil) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.submissionRepository = submissionRepository;
        this.answerRepository = answerRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // ✅ CREATE QUIZ
    @PostMapping("/create")
    public ResponseEntity<?> createQuiz(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody CreateQuizRequest request) {
        try {
            Quiz quiz = new Quiz();
            quiz.setTitle(request.getTitle());
            quiz.setDescription(request.getDescription());
            quiz.setDurationMinutes(request.getDurationMinutes());

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtUtil.extractUsername(token);
                userRepository.findByUsername(username).ifPresent(quiz::setCreatedBy);
            }

            quizRepository.save(quiz);

            for (QuizQuestion qq : request.getQuestions()) {
                Question question = new Question();
                question.setQuestionText(qq.getQuestionText());
                question.setMarks(qq.getMarks());
                question.setQuiz(quiz);
                questionRepository.save(question);

                for (QuizOption opt : qq.getOptions()) {
                    Option option = new Option();
                    option.setText(opt.getText());
                    option.setCorrect(opt.isCorrect());
                    option.setQuestion(question);
                    optionRepository.save(option);
                }
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "✅ Quiz created successfully!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // ✅ GET QUIZZES (Teacher/Admin)
    @GetMapping("/all")
    public ResponseEntity<?> getAllQuizzes(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String username = null;
        String role = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            username = jwtUtil.extractUsername(token);
            role = jwtUtil.extractRole(token);
        }

        List<Quiz> quizzes;
        if (role != null && role.equalsIgnoreCase("ROLE_ADMIN")) {
            quizzes = quizRepository.findAll();
        } else if (role != null && role.toUpperCase().contains("TEACHER")) {
            quizzes = quizRepository.findByCreatedBy_Username(username);
        } else {
            quizzes = Collections.emptyList();
        }

        quizzes.forEach(q -> {
            if (q.getQuestions() != null)
                q.getQuestions().forEach(ques -> ques.getOptions().size());
        });

        return ResponseEntity.ok(Map.of("success", true, "data", quizzes));
    }

    // ✅ NEW: PUBLIC ENDPOINT (for Students)
    @GetMapping("/public/all")
    public ResponseEntity<?> getAllQuizzesForStudents() {
        try {
            List<Quiz> quizzes = quizRepository.findAll();
            quizzes.forEach(q -> q.getQuestions().forEach(ques -> ques.getOptions().size()));
            return ResponseEntity.ok(Map.of("success", true, "data", quizzes));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuizById(@PathVariable Long id) {
        Optional<Quiz> optionalQuiz = quizRepository.findById(id);
        if (optionalQuiz.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "❌ Quiz not found"));
        }

        Quiz quiz = optionalQuiz.get();
        if (quiz.getQuestions() != null) quiz.getQuestions().forEach(q -> q.getOptions().size());

        return ResponseEntity.ok(Map.of("success", true, "data", quiz));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Long id) {
        if (!quizRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "❌ Quiz not found"));
        }
        quizRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "✅ Quiz deleted successfully!"));
    }

    // DTOs
    public static class CreateQuizRequest {
        private String title;
        private String description;
        private int durationMinutes;
        private List<QuizQuestion> questions;
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public int getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }
        public List<QuizQuestion> getQuestions() { return questions; }
        public void setQuestions(List<QuizQuestion> questions) { this.questions = questions; }
    }

    public static class QuizQuestion {
        private String questionText;
        private int marks;
        private List<QuizOption> options;
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public int getMarks() { return marks; }
        public void setMarks(int marks) { this.marks = marks; }
        public List<QuizOption> getOptions() { return options; }
        public void setOptions(List<QuizOption> options) { this.options = options; }
    }

    public static class QuizOption {
        private String text;
        private boolean correct;
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public boolean isCorrect() { return correct; }
        public void setCorrect(boolean correct) { this.correct = correct; }
    }
}
