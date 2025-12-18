package com.example.hr.repository;

import com.example.hr.model.ResignationApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ResignationApplicationRepository extends JpaRepository<ResignationApplication, Long> {
    List<ResignationApplication> findByArchiveId(String archiveId);
    List<ResignationApplication> findByApprovalStatus(String approvalStatus);
    Optional<ResignationApplication> findByArchiveIdAndApprovalStatus(String archiveId, String approvalStatus);
}