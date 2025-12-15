package com.example.hr.repository;

import com.example.hr.model.LeaveApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {
    List<LeaveApplication> findByApprovalStatus(String approvalStatus);
    List<LeaveApplication> findByArchiveId(String archiveId);
}