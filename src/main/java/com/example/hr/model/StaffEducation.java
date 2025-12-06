package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "t_staff_education")
@Data
public class StaffEducation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 12, nullable = false)
    private String archiveId;

    private String school;
    private String degree;
    private LocalDate startDate;
    private LocalDate endDate;
}