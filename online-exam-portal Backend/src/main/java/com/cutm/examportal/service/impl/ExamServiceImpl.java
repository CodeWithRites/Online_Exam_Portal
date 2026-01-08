package com.cutm.examportal.service.impl;

import com.cutm.examportal.entity.Exam;
import com.cutm.examportal.repository.ExamRepository;
import com.cutm.examportal.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExamServiceImpl implements ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Override
    public Exam createExam(Exam exam) {
        return examRepository.save(exam);
    }

    @Override
    public Exam updateExam(Long id, Exam updatedExam) {
        Exam existingExam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with id " + id));

        existingExam.setTitle(updatedExam.getTitle());
        existingExam.setSubject(updatedExam.getSubject());
        existingExam.setDescription(updatedExam.getDescription());

        return examRepository.save(existingExam);
    }

    @Override
    public void deleteExam(Long id) {
        examRepository.deleteById(id);
    }

    @Override
    public Exam getExamById(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with id " + id));
    }

    @Override
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }
}
