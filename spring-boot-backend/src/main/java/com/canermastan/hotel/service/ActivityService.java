package com.canermastan.hotel.service;

import com.canermastan.hotel.entity.Activity;
import com.canermastan.hotel.entity.Hotel;
import com.canermastan.hotel.repository.ActivityRepository;
import com.canermastan.hotel.repository.HotelRepository;
import com.canermastan.hotel.request.ActivityRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final HotelRepository hotelRepository;

    /**
     * Creates a new activity from a request
     */
    @Transactional
    public Activity createActivity(ActivityRequest request) {
        // Validate hotel exists
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new IllegalArgumentException("Hotel not found"));
        
        // Create activity entity from request
        Activity activity = new Activity();
        activity.setName(request.getName());
        activity.setDescription(request.getDescription());
        activity.setPrice(request.getPrice());
        activity.setCapacity(request.getCapacity());
        activity.setAvailableSlots(request.getCapacity()); // Başlangıçta tam kapasite
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        activity.setHotel(hotel);
        
        // Validate dates
        if (activity.getStartTime().isAfter(activity.getEndTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        
        if (activity.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start time cannot be in the past");
        }
        
        // Save and return the activity
        return activityRepository.save(activity);
    }
    
    /**
     * Gets an activity by ID
     */
    public Optional<Activity> getActivity(Long id) {
        return activityRepository.findById(id);
    }
    
    /**
     * Gets all activities for a hotel
     */
    public List<Activity> getActivitiesByHotel(Long hotelId) {
        return activityRepository.findByHotelId(hotelId);
    }
    
    /**
     * Gets all available activities for a hotel
     */
    public List<Activity> getAvailableActivitiesByHotel(Long hotelId) {
        return activityRepository.findAvailableActivitiesByHotelId(hotelId, LocalDateTime.now());
    }
    
    /**
     * Gets all activities for a hotel in a date range
     */
    public List<Activity> getActivitiesInDateRange(Long hotelId, LocalDateTime startTime, LocalDateTime endTime) {
        return activityRepository.findActivitiesInDateRange(hotelId, startTime, endTime);
    }
    
    /**
     * Cancels an activity
     */
    @Transactional
    public void cancelActivity(Long id) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity not found"));
        
        activity.setStatus(Activity.ActivityStatus.CANCELLED);
        activityRepository.save(activity);
    }
    
    /**
     * Updates an activity
     */
    @Transactional
    public Activity updateActivity(Long id, ActivityRequest request) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity not found"));
        
        if (request.getName() != null) {
            activity.setName(request.getName());
        }
        
        if (request.getDescription() != null) {
            activity.setDescription(request.getDescription());
        }
        
        if (request.getPrice() != null) {
            activity.setPrice(request.getPrice());
        }
        
        if (request.getCapacity() != null && request.getCapacity() > 0) {
            // If increasing capacity, adjust available slots too
            if (request.getCapacity() > activity.getCapacity()) {
                int additionalSlots = request.getCapacity() - activity.getCapacity();
                activity.setAvailableSlots(activity.getAvailableSlots() + additionalSlots);
            }
            activity.setCapacity(request.getCapacity());
        }
        
        if (request.getStartTime() != null) {
            activity.setStartTime(request.getStartTime());
        }
        
        if (request.getEndTime() != null) {
            activity.setEndTime(request.getEndTime());
        }
        
        // Validate dates
        if (activity.getStartTime().isAfter(activity.getEndTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        
        if (activity.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start time cannot be in the past");
        }
        
        return activityRepository.save(activity);
    }
    
    /**
     * Updates available slots when a reservation is made or cancelled
     */
    @Transactional
    public void updateAvailableSlots(Long activityId, int change) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new IllegalArgumentException("Activity not found"));
        
        int newAvailableSlots = activity.getAvailableSlots() + change;
        
        if (newAvailableSlots < 0) {
            throw new IllegalArgumentException("Not enough available slots");
        } else if (newAvailableSlots > activity.getCapacity()) {
            newAvailableSlots = activity.getCapacity();
        }
        
        activity.setAvailableSlots(newAvailableSlots);
        
        // Update status if full
        if (newAvailableSlots == 0) {
            activity.setStatus(Activity.ActivityStatus.FULL);
        } else if (activity.getStatus() == Activity.ActivityStatus.FULL) {
            activity.setStatus(Activity.ActivityStatus.ACTIVE);
        }
        
        activityRepository.save(activity);
    }
} 