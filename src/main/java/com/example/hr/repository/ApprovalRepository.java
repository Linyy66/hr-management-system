package com.example.hr.repository;

import com.example.hr.model.Approval;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApprovalRepository extends JpaRepository<Approval, Long> {
    List<Approval> findBySubmitter(String submitter);
    List<Approval> findByStatus(String status);
}