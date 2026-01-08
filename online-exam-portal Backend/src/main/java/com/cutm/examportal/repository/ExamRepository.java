package com.cutm.examportal.repository;

import com.cutm.examportal.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByCreatedBy_Username(String username);
}
