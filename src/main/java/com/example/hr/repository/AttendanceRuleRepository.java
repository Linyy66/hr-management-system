package com.example.hr.repository;

import com.example.hr.model.AttendanceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttendanceRuleRepository extends JpaRepository<AttendanceRule, Long> {
}