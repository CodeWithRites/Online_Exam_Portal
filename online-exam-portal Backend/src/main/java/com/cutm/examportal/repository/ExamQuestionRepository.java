package com.cutm.examportal.repository;

import com.cutm.examportal.entity.ExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, Long> {

    // ✅ Fetch exam questions by exam ID
    List<ExamQuestion> findByExam_Id(Long examId);
}
