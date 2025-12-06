package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_position")
@Data
public class Position {
    @Id
    @Column(length = 10)
    private String positionId;

    @Column(length = 2, nullable = false)
    private String org3Id;

    @Column(nullable = false, length = 50)
    private String positionName;

    private String createBy;
    private LocalDateTime createTime;
    private String updateBy;
    private LocalDateTime updateTime;
    private Integer version = 1;
}