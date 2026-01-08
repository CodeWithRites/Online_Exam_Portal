package com.cutm.examportal.repository;

import com.cutm.examportal.entity.Pyq;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PyqRepository extends JpaRepository<Pyq, Long> {
    List<Pyq> findBySubject(String subject);
}
