package com.example.hr.service;

import com.example.hr.model.OrgLevel1;
import com.example.hr.model.OrgLevel2;
import com.example.hr.model.OrgLevel3;
import com.example.hr.repository.OrgLevel1Repository;
import com.example.hr.repository.OrgLevel2Repository;
import com.example.hr.repository.OrgLevel3Repository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrgStructureService {
    
    private final OrgLevel1Repository orgLevel1Repository;
    private final OrgLevel2Repository orgLevel2Repository;
    private final OrgLevel3Repository orgLevel3Repository;
    
    public OrgStructureService(OrgLevel1Repository orgLevel1Repository,
                               OrgLevel2Repository orgLevel2Repository,
                               OrgLevel3Repository orgLevel3Repository) {
        this.orgLevel1Repository = orgLevel1Repository;
        this.orgLevel2Repository = orgLevel2Repository;
        this.orgLevel3Repository = orgLevel3Repository;
    }
    
    // 获取所有一级机构
    public List<OrgLevel1> getAllOrgLevel1() {
        return orgLevel1Repository.findAll();
    }
    
    // 获取所有二级机构
    public List<OrgLevel2> getAllOrgLevel2() {
        return orgLevel2Repository.findAll();
    }
    
    // 获取所有三级机构
    public List<OrgLevel3> getAllOrgLevel3() {
        return orgLevel3Repository.findAll();
    }
    
    // 根据一级机构ID获取其下属的二级机构
    public List<OrgLevel2> getOrgLevel2ByOrg1Id(String org1Id) {
        return orgLevel2Repository.findByOrg1Id(org1Id);
    }
    
    // 根据二级机构ID获取其下属的三级机构
    public List<OrgLevel3> getOrgLevel3ByOrg2Id(String org2Id) {
        return orgLevel3Repository.findByOrg2Id(org2Id);
    }
    
    // 检查一级机构是否存在
    public boolean existsOrgLevel1(String org1Id) {
        return orgLevel1Repository.existsById(org1Id);
    }
    
    // 检查二级机构是否存在
    public boolean existsOrgLevel2(String org2Id) {
        return orgLevel2Repository.existsById(org2Id);
    }
    
    // 检查三级机构是否存在
    public boolean existsOrgLevel3(String org3Id) {
        return orgLevel3Repository.existsById(org3Id);
    }
    
    // 根据ID查找一级机构
    public Optional<OrgLevel1> findOrgLevel1ById(String org1Id) {
        return orgLevel1Repository.findById(org1Id);
    }
    
    // 根据ID查找二级机构
    public Optional<OrgLevel2> findOrgLevel2ById(String org2Id) {
        return orgLevel2Repository.findById(org2Id);
    }
    
    // 根据ID查找三级机构
    public Optional<OrgLevel3> findOrgLevel3ById(String org3Id) {
        return orgLevel3Repository.findById(org3Id);
    }
}