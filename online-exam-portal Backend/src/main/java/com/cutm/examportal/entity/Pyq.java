package com.cutm.examportal.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pyqs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Pyq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String subject;
    private int year;

    @Column(name = "file_name")
    private String fileName; // must match DB column
}
