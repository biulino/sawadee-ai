package com.canermastan.hotel.controller;

import com.canermastan.hotel.dto.RoomDTO;
import com.canermastan.hotel.entity.Hotel;
import com.canermastan.hotel.entity.Room;
import com.canermastan.hotel.exception.BusinessException;
import com.canermastan.hotel.exception.ResourceNotFoundException;
import com.canermastan.hotel.mapper.DTOMapper;
import com.canermastan.hotel.repository.HotelRepository;
import com.canermastan.hotel.repository.RoomRepository;
import com.canermastan.hotel.request.RoomRequest;
import com.canermastan.hotel.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;
    private final RoomService roomService;
    private final DTOMapper dtoMapper;

    public RoomController(RoomRepository roomRepository, HotelRepository hotelRepository, 
                        RoomService roomService, DTOMapper dtoMapper) {
        this.roomRepository = roomRepository;
        this.hotelRepository = hotelRepository;
        this.roomService = roomService;
        this.dtoMapper = dtoMapper;
    }

    @PostMapping
    public ResponseEntity<RoomDTO> createRoom(@Valid @RequestBody RoomRequest request) {
        Hotel hotel = hotelRepository.findById(request.getHotelId())
            .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", request.getHotelId()));

        Room room = new Room();
        room.setRoomNumber(request.getRoomNumber());
        room.setName(request.getName());
        room.setCapacity(request.getCapacity());
        room.setHotel(hotel);
        
        // Set additional fields from request
        room.setType(request.getType());
        room.setDescription(request.getDescription());
        room.setPricePerNight(request.getPricePerNight());
        room.setHasWifi(request.isHasWifi());
        room.setHasTV(request.isHasTV());
        room.setHasBalcony(request.isHasBalcony());
        room.setHasMinibar(request.isHasMinibar());
        
        if (request.getFloorNumber() != null) {
            room.setFloorNumber(request.getFloorNumber());
        }
        
        if (request.getBedCount() != null) {
            room.setBedCount(request.getBedCount());
        }
        
        room.setStatus(request.getStatus());

        Room saved = roomRepository.save(room);
        return ResponseEntity.ok(dtoMapper.toRoomDTO(saved));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<RoomDTO> updateRoom(@PathVariable Long id, @Valid @RequestBody RoomRequest request) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Room", "id", id));
        
        // If hotel ID changed, verify the new hotel exists
        if (!room.getHotel().getId().equals(request.getHotelId())) {
            Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", request.getHotelId()));
            room.setHotel(hotel);
        }
        
        room.setRoomNumber(request.getRoomNumber());
        room.setName(request.getName());
        room.setCapacity(request.getCapacity());
        
        // Update additional fields
        room.setType(request.getType());
        room.setDescription(request.getDescription());
        room.setPricePerNight(request.getPricePerNight());
        room.setHasWifi(request.isHasWifi());
        room.setHasTV(request.isHasTV());
        room.setHasBalcony(request.isHasBalcony());
        room.setHasMinibar(request.isHasMinibar());
        
        if (request.getFloorNumber() != null) {
            room.setFloorNumber(request.getFloorNumber());
        }
        
        if (request.getBedCount() != null) {
            room.setBedCount(request.getBedCount());
        }
        
        room.setStatus(request.getStatus());
        
        Room saved = roomRepository.save(room);
        return ResponseEntity.ok(dtoMapper.toRoomDTO(saved));
    }

    @GetMapping("/hotel/{hotelId}")
    public List<RoomDTO> getRoomsByHotel(@PathVariable Long hotelId) {
        return dtoMapper.toRoomDTOList(roomRepository.findByHotelId(hotelId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RoomDTO> getRoomById(@PathVariable Long id) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Room", "id", id));
        return ResponseEntity.ok(dtoMapper.toRoomDTO(room));
    }

    @GetMapping("/{roomId}/availability")
    public ResponseEntity<String> checkRoomAvailability(
            @PathVariable Long roomId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        
        if (!roomRepository.existsById(roomId)) {
            throw new ResourceNotFoundException("Room", "id", roomId);
        }
        
        boolean isAvailable = roomService.isRoomAvailable(roomId, startDate, endDate);
        
        if (isAvailable) {
            return ResponseEntity.ok("Room is available for the selected dates");
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Room is not available for the selected dates");
        }
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<RoomDTO>> getAvailableRooms(
            @RequestParam Long hotelId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        
        List<Room> availableRooms = roomService.getAvailableRooms(hotelId, startDate, endDate);
        return ResponseEntity.ok(dtoMapper.toRoomDTOList(availableRooms));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Room", "id", id));
            
        if (!room.getReservations().isEmpty()) {
            throw new BusinessException("Cannot delete room with existing reservations");
        }
        
        roomRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
