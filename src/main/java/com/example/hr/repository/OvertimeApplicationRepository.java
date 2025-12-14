package com.example.hr.repository;

import com.example.hr.model.OvertimeApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OvertimeApplicationRepository extends JpaRepository<OvertimeApplication, Long> {
    List<OvertimeApplication> findByArchiveId(String archiveId);
    List<OvertimeApplication> findByApprovalStatus(String approvalStatus);
}