package com.example.hr.repository;

import com.example.hr.model.LeaveApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {
    List<LeaveApplication> findByUserId(String userId);
    List<LeaveApplication> findByStatus(String status);
}