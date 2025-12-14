package com.example.hr.repository;

import com.example.hr.model.OrgLevel3;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrgLevel3Repository extends JpaRepository<OrgLevel3, String> {
    List<OrgLevel3> findByOrg2Id(String org2Id);
}