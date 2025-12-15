package com.example.hr.repository;

import com.example.hr.model.OvertimeApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OvertimeApplicationRepository extends JpaRepository<OvertimeApplication, Long> {
    List<OvertimeApplication> findByApprovalStatus(String approvalStatus);
    List<OvertimeApplication> findByArchiveId(String archiveId);
}