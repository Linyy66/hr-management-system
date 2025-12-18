package com.example.hr.repository;

import com.example.hr.model.EmployeeProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmployeeProfileRepository extends JpaRepository<EmployeeProfile, String> {
    List<EmployeeProfile> findByAccountId(String accountId);
    Optional<EmployeeProfile> findOneByAccountId(String accountId);
}