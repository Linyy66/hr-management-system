package com.example.hr.controller;

import com.example.hr.dto.ApiResponse;
import com.example.hr.model.AttendanceShift;
import com.example.hr.repository.AttendanceShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/attendance-shifts")
public class AttendanceShiftController {
    
    @Autowired
    private AttendanceShiftRepository attendanceShiftRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttendanceShift>>> list() {
        List<AttendanceShift> shifts = attendanceShiftRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(shifts));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AttendanceShift>> create(@RequestBody AttendanceShift shift) {
        shift.setCreateTime(LocalDateTime.now());
        AttendanceShift savedShift = attendanceShiftRepository.save(shift);
        return ResponseEntity.ok(ApiResponse.success("班次创建成功", savedShift));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AttendanceShift>> get(@PathVariable Long id) {
        return attendanceShiftRepository.findById(id)
            .map(shift -> ResponseEntity.ok(ApiResponse.success(shift)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AttendanceShift>> update(@PathVariable Long id, @RequestBody AttendanceShift shift) {
        return attendanceShiftRepository.findById(id).map(existing -> {
            existing.setPositionId(shift.getPositionId());
            existing.setShiftJson(shift.getShiftJson());
            existing.setStatus(shift.getStatus());
            AttendanceShift saved = attendanceShiftRepository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("班次更新成功", saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        if (!attendanceShiftRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        attendanceShiftRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("班次删除成功"));
    }
}