package com.canermastan.hotel.controller;

import com.canermastan.hotel.dto.HotelDTO;
import com.canermastan.hotel.entity.Hotel;
import com.canermastan.hotel.entity.Room;
import com.canermastan.hotel.exception.ResourceNotFoundException;
import com.canermastan.hotel.mapper.DTOMapper;
import com.canermastan.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;
    private final DTOMapper dtoMapper;

    @PostMapping
    public ResponseEntity<HotelDTO> createHotel(@RequestBody Hotel hotel) {
        Hotel savedHotel = hotelService.createHotel(hotel);
        return new ResponseEntity<>(dtoMapper.toHotelDTO(savedHotel), HttpStatus.CREATED);
    }

    @GetMapping
    public List<HotelDTO> getHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice
    ) {
        return dtoMapper.toHotelDTOList(hotelService.searchHotels(city, minPrice, maxPrice));
    }

    @GetMapping("/count")
    public Map<String, Long> countHotels(@RequestParam String city) {
        long count = hotelService.countHotelsByCity(city);
        return Collections.singletonMap("count", count);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HotelDTO> getHotel(@PathVariable Long id) {
        Hotel hotel = hotelService.getHotelById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
        return ResponseEntity.ok(dtoMapper.toHotelDTO(hotel));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HotelDTO> updateHotel(@PathVariable Long id, @RequestBody Hotel hotel) {
        Hotel updatedHotel = hotelService.updateHotel(id, hotel);
        return ResponseEntity.ok(dtoMapper.toHotelDTO(updatedHotel));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @PathVariable Long id,
            @RequestParam LocalDate checkIn,
            @RequestParam LocalDate checkOut
    ) {
        Map<String, Object> result = hotelService.checkAvailability(id, checkIn, checkOut);
        
        if (result.containsKey("availableRooms")) {
            List<Room> rooms = (List<Room>) result.get("availableRooms");
            result.put("availableRooms", dtoMapper.toRoomDTOList(rooms));
        }
        
        return ResponseEntity.ok(result);
    }
}
