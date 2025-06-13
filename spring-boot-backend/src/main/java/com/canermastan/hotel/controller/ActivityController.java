package com.canermastan.hotel.controller;

import com.canermastan.hotel.dto.ActivityDTO;
import com.canermastan.hotel.entity.Activity;
import com.canermastan.hotel.exception.ResourceNotFoundException;
import com.canermastan.hotel.mapper.DTOMapper;
import com.canermastan.hotel.request.ActivityRequest;
import com.canermastan.hotel.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ActivityController {

    private final ActivityService activityService;
    private final DTOMapper dtoMapper;

    @PostMapping
    public ResponseEntity<ActivityDTO> createActivity(@RequestBody ActivityRequest request) {
        Activity activity = activityService.createActivity(request);
        return new ResponseEntity<>(dtoMapper.toActivityDTO(activity), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ActivityDTO>> getActivitiesByHotel(@RequestParam Long hotelId) {
        List<Activity> activities = activityService.getActivitiesByHotel(hotelId);
        return ResponseEntity.ok(dtoMapper.toActivityDTOList(activities));
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<ActivityDTO>> getAvailableActivities(@RequestParam Long hotelId) {
        List<Activity> activities = activityService.getAvailableActivitiesByHotel(hotelId);
        return ResponseEntity.ok(dtoMapper.toActivityDTOList(activities));
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<ActivityDTO>> getActivitiesInDateRange(
            @RequestParam Long hotelId,
            @RequestParam LocalDateTime startTime,
            @RequestParam LocalDateTime endTime) {
        List<Activity> activities = activityService.getActivitiesInDateRange(hotelId, startTime, endTime);
        return ResponseEntity.ok(dtoMapper.toActivityDTOList(activities));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityDTO> getActivity(@PathVariable Long id) {
        Activity activity = activityService.getActivity(id)
            .orElseThrow(() -> new ResourceNotFoundException("Activity", "id", id));
        return ResponseEntity.ok(dtoMapper.toActivityDTO(activity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityDTO> updateActivity(
            @PathVariable Long id,
            @RequestBody ActivityRequest request) {
        Activity activity = activityService.updateActivity(id, request);
        return ResponseEntity.ok(dtoMapper.toActivityDTO(activity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelActivity(@PathVariable Long id) {
        activityService.cancelActivity(id);
        return ResponseEntity.ok().build();
    }
} 