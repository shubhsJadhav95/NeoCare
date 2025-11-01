package com.neocare.virtualdoc_service.controller;

import com.neocare.virtualdoc_service.model.Doctor;
import com.neocare.virtualdoc_service.service.VirtualDocService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/virtual")
public class VirtualDocController {

    @Autowired
    private VirtualDocService virtualDocService;

    @GetMapping("/doctors")
    public List<Doctor> getDoctors(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String specialization
    ) {
        return virtualDocService.getDoctors(id, name, specialization);
    }
}
