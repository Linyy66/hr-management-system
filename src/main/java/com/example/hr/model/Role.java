package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;

@Entity
@Table(name = "t_role", uniqueConstraints = {@UniqueConstraint(columnNames = {"name"})})
@Data
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, nullable = false)
    private String name;
}