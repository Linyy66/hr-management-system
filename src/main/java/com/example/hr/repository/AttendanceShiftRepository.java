package com.example.hr.repository;

import com.example.hr.model.AttendanceShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttendanceShiftRepository extends JpaRepository<AttendanceShift, Long> {
}