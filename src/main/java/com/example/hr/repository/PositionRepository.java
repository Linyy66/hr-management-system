package com.example.hr.repository;

import com.example.hr.model.Position;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PositionRepository extends JpaRepository<Position, String> {
    List<Position> findByOrg3Id(String org3Id);
}