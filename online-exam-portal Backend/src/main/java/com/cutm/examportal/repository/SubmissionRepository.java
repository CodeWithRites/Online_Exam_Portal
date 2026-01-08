package com.cutm.examportal.repository;

import com.cutm.examportal.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    // submissions by student's username
    List<Submission> findByStudent_Username(String username);

    // submissions for exams created by a teacher (by teacher username)
    List<Submission> findByExam_CreatedBy_Username(String teacherUsername);

    // same but only evaluated (optional helper)
    List<Submission> findByExam_CreatedBy_UsernameAndEvaluated(String teacherUsername, boolean evaluated);
}
