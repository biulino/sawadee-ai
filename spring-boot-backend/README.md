# Hotel Reservation System

Bu proje, Spring Boot ile geliştirilmiş basit bir otel rezervasyon sistemidir. Sistem, otel listeleme, oda yönetimi, rezervasyon yapma, ödeme işlemleri ve check-in/check-out işlemlerini desteklemektedir.

## Özellikler

- **Otel Yönetimi**: Otel ekleme, listeleme ve arama
- **Oda Yönetimi**: Otel odalarını tanımlama, müsait odaları listeleme
- **Rezervasyon Sistemi**: Rezervasyon oluşturma, iptal etme, görüntüleme
- **Ödeme İşlemleri**: Ödeme yapma, ödeme iadesi
- **Check-in/Check-out**: Rezervasyon onaylandıktan sonra check-in ve check-out işlemleri

## Teknik Mimari

Proje aşağıdaki katmanlardan oluşmaktadır:

- **Entity Layer**: Veritabanı objelerinin Java sınıfları
- **Repository Layer**: Veritabanı işlemleri için JPA repository'leri
- **Service Layer**: İş mantığının bulunduğu servis sınıfları
- **Controller Layer**: API endpoint'lerinin tanımlandığı controller sınıfları
- **Request/Response Layer**: API istekleri ve yanıtları için model sınıfları
- **Exception Handling**: Uygulama genelinde hata yönetimi için exception handling

## API Endpoints

### Oteller

- `GET /api/hotels` - Tüm otelleri listele
- `GET /api/hotels?city=...&minPrice=...&maxPrice=...` - Filtrelere göre otelleri listele
- `GET /api/hotels/{id}` - Tek bir oteli görüntüle
- `POST /api/hotels` - Yeni bir otel ekle
- `PUT /api/hotels/{id}` - Bir oteli güncelle
- `DELETE /api/hotels/{id}` - Bir oteli sil
- `GET /api/hotels/{id}/availability` - Bir otelin müsaitlik durumunu kontrol et

### Odalar

- `GET /api/rooms/hotel/{hotelId}` - Bir otele ait tüm odaları listele
- `GET /api/rooms/{id}` - Tek bir odayı görüntüle
- `GET /api/rooms/{roomId}/availability` - Bir odanın belirli tarihler arasında müsaitlik durumunu kontrol et
- `GET /api/rooms/available` - Belirli tarihler arasında müsait odaları listele
- `POST /api/rooms` - Yeni bir oda ekle
- `PUT /api/rooms/{id}` - Bir odayı güncelle
- `DELETE /api/rooms/{id}` - Bir odayı sil

### Rezervasyonlar

- `POST /api/reservations` - Yeni bir rezervasyon oluştur
- `GET /api/reservations/{id}` - Tek bir rezervasyonu görüntüle
- `GET /api/reservations/hotel/{hotelId}` - Bir otele ait tüm rezervasyonları listele
- `GET /api/reservations/room/{roomId}` - Bir odaya ait tüm rezervasyonları listele
- `DELETE /api/reservations/{id}` - Bir rezervasyonu iptal et
- `POST /api/reservations/{id}/check-in` - Rezervasyon için check-in işlemi
- `POST /api/reservations/{id}/check-out` - Rezervasyon için check-out işlemi

### Ödemeler

- `POST /api/payments/process/{reservationId}` - Bir rezervasyon için ödeme işlemi
- `POST /api/payments/refund/{reservationId}` - Bir rezervasyon için ödeme iadesi

## Kullanım

### Bir Rezervasyon Oluşturma

1. İlk adım olarak otelleri listeleyerek veya filtreleyerek bir otel seçin:
   ```
   GET /api/hotels?city=Istanbul
   ```

2. Seçilen otelin müsaitlik durumunu kontrol edin:
   ```
   GET /api/hotels/{hotelId}/availability?checkIn=2023-06-01&checkOut=2023-06-05
   ```

3. Müsait odaları listeleyip bir oda seçin:
   ```
   GET /api/rooms/available?hotelId={hotelId}&startDate=2023-06-01&endDate=2023-06-05
   ```

4. Rezervasyon oluşturun:
   ```
   POST /api/reservations
   
   {
     "fullName": "John Doe",
     "email": "john@example.com",
     "phone": "5551234567",
     "numberOfGuests": 2,
     "checkInDate": "2023-06-01",
     "checkOutDate": "2023-06-05",
     "numberOfRooms": 1,
     "hotelId": 1,
     "roomId": 1,
     "paymentMethod": "CREDIT_CARD"
   }
   ```

5. Ödeme işlemi yapın:
   ```
   POST /api/payments/process/{reservationId}?paymentMethod=CREDIT_CARD
   
   {
     "cardNumber": "4111111111111111",
     "expiryMonth": "12",
     "expiryYear": "2025",
     "cvc": "123"
   }
   ```

6. Check-in işlemi (rezervasyon tarihi geldiğinde):
   ```
   POST /api/reservations/{reservationId}/check-in
   ```

7. Check-out işlemi (çıkış yapılacağı zaman):
   ```
   POST /api/reservations/{reservationId}/check-out
   ```

## Teknolojiler

- Java 17
- Spring Boot 3.x
- Spring Data JPA
- Spring Security
- PostgreSQL
- Keycloak (Kimlik yönetimi)
- RESTful API
- Maven

## Kurulum

1. Projeyi klonlayın
2. `application.properties` dosyasında veritabanı bağlantı bilgilerini ayarlayın
3. Maven ile projeyi derleyin: `mvn clean install`
4. Uygulamayı çalıştırın: `mvn spring-boot:run`
5. API'ye erişim: `http://localhost:8099` 