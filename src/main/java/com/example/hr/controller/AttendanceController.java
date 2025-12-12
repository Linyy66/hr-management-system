package com.example.hr.controller;

import com.example.hr.model.AttendanceRecord;
import com.example.hr.repository.AttendanceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Attendance endpoints:
 * - POST /api/attendance : employee create a record (WORK/LEAVE/BUSINESS)
 * - GET /api/attendance/mine : employee list own records
 * - GET /api/attendance : HR/Manager/ADMIN can list (optionally filter by date)
 */
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;

    public AttendanceController(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> create(@RequestBody AttendanceRecord payload, Authentication auth) {
        AttendanceRecord r = new AttendanceRecord();
        r.setUsername(auth.getName());
        r.setPositionId(payload.getPositionId());
        r.setDate(payload.getDate() != null ? payload.getDate() : LocalDate.now());
        r.setType(payload.getType() != null ? payload.getType() : "WORK");
        r.setTimestamp(LocalDateTime.now());
        r.setNote(payload.getNote());
        AttendanceRecord saved = attendanceRepository.save(r);
        return ResponseEntity.created(URI.create("/api/attendance/" + saved.getId())).body(saved);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<AttendanceRecord> mine(Authentication auth) {
        return attendanceRepository.findByUsernameOrderByDateDescTimestampDesc(auth.getName());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HR_SPEC','HR_MANAGER','ADMIN')")
    public List<AttendanceRecord> list(@RequestParam(required = false) String date) {
        if (date != null && !date.isBlank()) {
            LocalDate d = LocalDate.parse(date);
            return attendanceRepository.findByDate(d);
        }
        return attendanceRepository.findAll();
    }
}