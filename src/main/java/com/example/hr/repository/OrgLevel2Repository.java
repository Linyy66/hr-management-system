// src/main/java/com/example/hr/repository/OrgLevel2Repository.java
package com.example.hr.repository;

import com.example.hr.model.OrgLevel2;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrgLevel2Repository extends JpaRepository<OrgLevel2, String> {
    List<OrgLevel2> findByOrg1Id(String org1Id);
}