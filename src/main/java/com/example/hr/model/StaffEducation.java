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

    // 使用 ManyToOne 关联 StaffArchive，外键列名 archive_id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "archive_id", nullable = false)
    private StaffArchive staffArchive;

    private String school;
    private String degree;
    private LocalDate startDate;
    private LocalDate endDate;
}