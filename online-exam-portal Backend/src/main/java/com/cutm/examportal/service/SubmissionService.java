package com.cutm.examportal.service;

import com.cutm.examportal.entity.Answer;
import com.cutm.examportal.entity.Question;
import com.cutm.examportal.entity.Submission;
import com.cutm.examportal.repository.AnswerRepository;
import com.cutm.examportal.repository.QuestionRepository;
import com.cutm.examportal.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private QuestionRepository questionRepository;

    public Submission saveSubmission(Submission submission, List<Answer> answers) {
        // Save submission first
        Submission savedSubmission = submissionRepository.save(submission);

        // Link each answer to the saved submission and question
        for (Answer ans : answers) {
            if (ans.getQuestion() != null && ans.getQuestion().getId() != null) {
                Question question = questionRepository.findById(ans.getQuestion().getId())
                        .orElseThrow(() -> new RuntimeException("Question not found for ID " + ans.getQuestion().getId()));
                ans.setQuestion(question);
            }
            ans.setSubmission(savedSubmission);
            answerRepository.save(ans);
        }

        return savedSubmission;
    }
}
