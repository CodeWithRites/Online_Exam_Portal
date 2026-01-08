package com.cutm.examportal.repository;

import com.cutm.examportal.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    // Correct field name is 'quiz' (not 'exam') for quiz queries
    List<Question> findByQuiz_Id(Long quizId);

    // If you need exam queries too:
    List<Question> findByExam_Id(Long examId);
}
