package com.cutm.examportal.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateExamRequest {

    private String subject;
    private String title;
    private int durationMinutes;
    private String description;
    private List<QuestionDTO> questions;

    @Data
    public static class QuestionDTO {
        private String text;
        private int marks;
        private String type; // ✅ Must match Angular's JSON key: "type"
    }
}
