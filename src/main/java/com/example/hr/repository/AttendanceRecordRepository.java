package com.example.hr.repository;

import com.example.hr.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByUserId(String userId);
    
    List<AttendanceRecord> findByUserIdAndClockInTimeBetween(String userId, LocalDate startDate, LocalDate endDate);
    
    Long countByAbnormal(Boolean abnormal);
}