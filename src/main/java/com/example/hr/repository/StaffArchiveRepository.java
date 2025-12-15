package com.example.hr.repository;

import com.example.hr.model.StaffArchive;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffArchiveRepository extends JpaRepository<StaffArchive, String> {
    List<StaffArchive> findByOrg1IdAndOrg2IdAndOrg3Id(String org1Id, String org2Id, String org3Id);
    List<StaffArchive> findByAccountId(String accountId);
}