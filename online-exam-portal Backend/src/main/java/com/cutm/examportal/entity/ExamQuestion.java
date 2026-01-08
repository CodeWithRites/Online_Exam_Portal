//package com.cutm.examportal.entity;
//
//import com.fasterxml.jackson.annotation.JsonBackReference;
//import jakarta.persistence.*;
//import lombok.Data;
//
//@Entity
//@Table(name = "exam_questions")
//@Data
//public class ExamQuestion {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(nullable = false)
//    private String questionText;
//
//    private int marks;
//
//    private String type;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "exam_id")
//    @JsonBackReference
//    private Exam exam;
//}
