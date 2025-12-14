package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_position")
@Data
public class Position {
    @Id
    @Column(name = "position_id", length = 20)
    private String positionId;

    @Column(name = "org3_id", length = 6, nullable = false)
    private String org3Id;

    @Column(name = "position_name", nullable = false, length = 50)
    private String positionName;

    @Column(name = "create_by")
    private String createBy;
    
    @Column(name = "create_time")
    private LocalDateTime createTime;
    
    @Column(name = "update_by")
    private String updateBy;
    
    @Column(name = "update_time")
    private LocalDateTime updateTime;
    
    @Column(name = "version")
    private Integer version = 1;
}