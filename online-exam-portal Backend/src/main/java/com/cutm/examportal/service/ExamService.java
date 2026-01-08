package com.cutm.examportal.service;

import com.cutm.examportal.entity.Exam;
import java.util.List;

public interface ExamService {

    Exam createExam(Exam exam);
    Exam updateExam(Long id, Exam updatedExam);
    void deleteExam(Long id);
    Exam getExamById(Long id);
    List<Exam> getAllExams();
}
