package com.example.hr.repository;

import com.example.hr.model.DepartmentChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DepartmentChangeRequestRepository extends JpaRepository<DepartmentChangeRequest, Long> {
    List<DepartmentChangeRequest> findByArchiveId(String archiveId);
    List<DepartmentChangeRequest> findByApprovalStatus(String approvalStatus);
}