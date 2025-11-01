package com.neocare.virtualdoc_service;


import org.springframework.cloud.openfeign.FeignClient;

@FeignClient("AUTH-SERVICE")
public interface VirtualDoc {

    
}
