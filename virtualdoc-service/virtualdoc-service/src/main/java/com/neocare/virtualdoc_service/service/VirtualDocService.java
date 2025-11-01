package com.neocare.virtualdoc_service.service;

import com.neocare.virtualdoc_service.VirtualDoc;
import com.neocare.virtualdoc_service.model.Doctor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VirtualDocService {

    @Autowired
    private VirtualDoc virtualDoc;

    public List<Doctor> getDoctors(Long id, String name, String specialization) {
        return virtualDoc.getDoctors(id, name, specialization);
    }
}
