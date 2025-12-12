// src/main/java/com/example/hr/model/OrgLevel3.java
package com.example.hr.model;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "t_org_level3")
public class OrgLevel3 {
    @Id
    @Column(name = "org3_id")
    private String org3Id;

    @Column(name = "org2_id", nullable = false)
    private String org2Id;

    @Column(name = "org3_name", nullable = false)
    private String org3Name;

    @Column(name = "create_by", nullable = false)
    private String createBy;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Column(name = "update_by")
    private String updateBy;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    @Version
    private Integer version;

    @PrePersist
    public void prePersist() {
        createTime = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updateTime = LocalDateTime.now();
    }
}