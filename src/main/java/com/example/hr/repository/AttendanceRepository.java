package com.example.hr.repository;

import com.example.hr.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByUsernameOrderByDateDescTimestampDesc(String username);
    List<AttendanceRecord> findByDate(LocalDate date);
}