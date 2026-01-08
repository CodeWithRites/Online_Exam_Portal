package com.cutm.examportal.repository;

import com.cutm.examportal.entity.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OptionRepository extends JpaRepository<Option, Long> {
    List<Option> findByQuestion_Id(Long questionId);
}
