# Derin Öğrenme Tabanlı Otel Öneri Sistemi

Bu proje, kullanıcı tercihleri ve otel özellikleri arasındaki karmaşık ilişkileri öğrenerek kişiselleştirilmiş otel önerileri sunan derin öğrenme tabanlı bir öneri sistemidir. Geleneksel filtreleme yöntemleriyle derin öğrenme tekniklerini birleştirerek, kullanıcılara özel ihtiyaçlarına ve tercihlerine uygun otel ve oda seçenekleri önermektedir.

## Kullanılan Yapay Zeka Teknolojileri ve Teknikler

### 1. Veri İşleme ve Özellik Çıkarımı

#### Özellik Mühendisliği
Projede, ham kullanıcı ve otel verilerinden anlamlı özellikler çıkaran gelişmiş özellik mühendisliği teknikleri kullanılmıştır:

- **Kullanıcı Özellikleri**:
  - Bütçe tercihleri (minimum, maksimum, ortalama ve aralık değerleri)
  - Oda tipi tercihleri (One-hot encoding ile)
  - Kapasite gereksinimleri
  - Tercih edilen özellikler (WiFi, TV, Balkon, Minibar)

- **Otel Özellikleri**:
  - Fiyat istatistikleri (ortalama, minimum, maksimum fiyatlar)
  - Oda tipi oranları (deluxe, standart oda oranları)
  - Kapasite istatistikleri
  - Sunulan özellikler ve bunların oranları

- **Özellik Normalizasyonu**: Tüm özellikler, MinMaxScaler kullanılarak 0-1 aralığına normalize edilmiştir. Bu, farklı ölçeklerdeki özelliklerin (örneğin fiyat ve boolean özellikler) model tarafından eşit değerlendirilmesini sağlar.

```python
# Normalize et
user_features = np.array(user_data, dtype=np.float32)
scaler = MinMaxScaler()
user_features = scaler.fit_transform(user_features)
```

#### Sentetik Veri Üretimi
Denetimli öğrenme gerektiren öneri modelimiz için eğitim verisi oluşturmak amacıyla, gerçekçi kullanıcı-otel etkileşimleri sentetik olarak üretilmiştir:

- **Etkileşim Sentezi**: Kullanıcı tercihleri ile otel özellikleri arasındaki uyum, çeşitli faktörlere göre puanlanarak sentetik etkileşimler oluşturulmuştur:
  - Bütçe uyumu
  - Oda tipi uyumu
  - Kapasite yeterliliği
  - Özellik eşleşmeleri

- **Gerçeklik Faktörü**: Sentetik puanlamalara gerçekçilik kazandırmak için Gaussian gürültü eklenmiştir:
```python
# Rasgeleleştirme ekle (gerçek verilere benzemesi için)
noise = np.random.normal(0, 0.2)  # Az gürültü ekle
rating = min(5, max(1, base_rating + noise))
```

### 2. Derin Öğrenme Modeli Mimarisi

#### Embedding Tabanlı Hibrit Model
Projede kullanılan sinir ağı modeli, birçok modern derin öğrenme tekniğini bir araya getiren hibrit bir mimariye sahiptir:

- **Embedding Katmanları**: Kullanıcı ve otellerin gizli özelliklerini öğrenen düşük boyutlu vektörler:
```python
self.user_embedding = nn.Embedding(num_users, EMBEDDING_DIM)
self.hotel_embedding = nn.Embedding(num_hotels, EMBEDDING_DIM)
```

- **Özellik Dönüşüm Ağları**: Ham özellikleri anlamlı temsillere dönüştüren alt ağlar:
```python
self.user_features_network = nn.Sequential(
    nn.Linear(user_features_dim, EMBEDDING_DIM * 2),
    nn.ReLU(),
    nn.BatchNorm1d(EMBEDDING_DIM * 2),
    nn.Dropout(0.2),
    nn.Linear(EMBEDDING_DIM * 2, EMBEDDING_DIM)
)
```

- **Dikkat (Attention) Mekanizması**: Kullanıcı ve otel arasındaki etkileşimleri modellemek için kullanılan gelişmiş bir teknik:
```python
self.attention = nn.Sequential(
    nn.Linear(EMBEDDING_DIM * 2, EMBEDDING_DIM),
    nn.Tanh(),
    nn.Linear(EMBEDDING_DIM, 1)
)
```

Dikkat mekanizması, hangi kullanıcı ve otel özelliklerinin puanlamada daha önemli olduğunu öğrenmesini sağlar.

- **Derin Sinir Ağı Katmanları**: Birleştirilmiş özellikleri işleyen ve final puanlamayı üreten çok katmanlı yapı:
```python
# Derin sinir ağı katmanları
layers = []
prev_dim = combined_dim
for i, hidden_dim in enumerate(HIDDEN_LAYERS):
    layers.append(nn.Linear(prev_dim, hidden_dim))
    layers.append(nn.ReLU())
    layers.append(nn.BatchNorm1d(hidden_dim))
    dropout_rate = 0.3 if i < len(HIDDEN_LAYERS) - 1 else 0.2
    layers.append(nn.Dropout(dropout_rate))
    prev_dim = hidden_dim
```

### 3. Eğitim Stratejileri ve Optimizasyon Teknikleri

#### Gelişmiş Eğitim Süreci
Model eğitiminde modern derin öğrenme yaklaşımları kullanılmıştır:

- **Adam Optimizer**: Adaptif öğrenme oranı ile gradyan inişini optimize eden, momentum ve RMSprop avantajlarını birleştiren gelişmiş bir optimizasyon algoritması:
```python
optimizer = optim.Adam(self.model.parameters(), lr=LEARNING_RATE, weight_decay=1e-5)
```

- **Öğrenme Oranı Zamanlayıcısı**: Eğitim sürecinde performans düşüşlerinde öğrenme oranını otomatik azaltan mekanizma:
```python
scheduler = optim.lr_scheduler.ReduceLROnPlateau(
    optimizer, mode='min', factor=0.5, patience=5, verbose=True, min_lr=1e-6
)
```

- **Batch Normalization**: Eğitim sürecini hızlandıran ve gradient vanishing/exploding sorunlarını azaltan katman normalizasyonu tekniği.

- **Dropout Düzenleştirmesi**: Modelin aşırı öğrenmesini (overfitting) engellemek için nöron bağlantılarını rastgele devre dışı bırakan teknik.

- **Erken Durdurma (Early Stopping)**: Validasyon setindeki performans iyileşmeyi durduğunda eğitimi sonlandıran, eğitim süresini kısaltan ve overfitting'i engelleyen yaklaşım:
```python
# Early stopping kontrolü
if avg_val_loss < best_val_loss:
    best_val_loss = avg_val_loss
    patience_counter = 0
    # En iyi model olarak kaydet
    torch.save(self.model.state_dict(), self.model_path)
else:
    patience_counter += 1
    # Sabırsızlık kontrolü
    if patience_counter >= EARLY_STOPPING_PATIENCE:
        print(f"Early stopping! {EARLY_STOPPING_PATIENCE} epoch boyunca iyileşme olmadı.")
        break
```

- **Gradient Clipping**: Gradyan patlamasını önleyerek eğitim stabilitesini artıran teknik:
```python
# Gradyan kesme (exploding gradient sorununu önlemek için)
torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
```

### 4. Değerlendirme Metrikleri ve Performans Analizi

#### Kapsamlı Model Değerlendirmesi
Sistemin performansını farklı açılardan değerlendirmek için çeşitli metrikler kullanılmıştır:

- **MSE (Mean Squared Error)**: Tahminler ile gerçek değerler arasındaki karesel farkların ortalaması.
- **RMSE (Root Mean Squared Error)**: MSE'nin karekökü, tahmin hatalarını orijinal ölçekte değerlendirme imkanı sunar.
- **MAE (Mean Absolute Error)**: Tahminler ile gerçek değerler arasındaki mutlak farkların ortalaması.
- **R2 Skoru**: Modelin açıklayabildiği varyans oranını gösteren determinasyon katsayısı.
- **Tolerans İçindeki Tahminler**: Belirli bir hata marjı içinde olan tahminlerin yüzdesi.

```python
# Tolerans içindeki tahminlerin oranı
tolerance_levels = [0.25, 0.5, 0.75, 1.0]
within_tolerance = {}
for tol in tolerance_levels:
    within_tol = np.mean(np.abs(predictions - targets) <= tol)
    within_tolerance[tol] = within_tol
```

#### Görselleştirme
Model performansını anlamak için çeşitli görselleştirme teknikleri kullanılmıştır:

- **Tahmin vs Gerçek Değer Grafikleri**: Modelin doğruluğunu görsel olarak değerlendirme
- **Hata Dağılımı Histogramları**: Hataların normal dağılıp dağılmadığını kontrol etme
- **Kategorik Analizler**: Farklı puan kategorilerindeki performans analizi
- **Kullanıcı ve Otel Dağılımları**: Test veri kümesinin temsil gücünü görselleştirme

### 5. Hibrit Öneri Yaklaşımı

#### Derin Öğrenme ve Kural Tabanlı Filtrelemenin Birleşimi
Projede, derin öğrenme ile içerik tabanlı filtreleme bir arada kullanılmıştır:

- **Derin Öğrenme Puanlaması**: Model, kullanıcı-otel uyumuna bir temel puan atar.
- **Kural Tabanlı Filtreleme**: Bu temel puan, çeşitli faktörlere göre ayarlanır:
  - Bütçe uyumu
  - Oda tipi tercihi
  - Kapasite yeterliliği
  - Özellik eşleşmeleri

```python
# Bütçe uyumu kontrolü
min_budget = user['preferredBudget']['min']
max_budget = user['preferredBudget']['max']
room_price = room['pricePerNight']
budget_factor = 1.0

# Bütçe dışındaysa puanını düşür
if room_price < min_budget * 0.8:
    budget_factor = 0.9  # Çok ucuz
elif room_price > max_budget * 1.2:
    budget_factor = 0.5  # Çok pahalı
elif room_price < min_budget:
    budget_factor = 0.95  # Biraz ucuz
elif room_price > max_budget:
    budget_factor = 0.7  # Biraz pahalı
else:
    budget_factor = 1.1  # Bütçeye tam uygun, bonus puan

room_score *= budget_factor
```

### 6. API ve Kullanıcı Arayüzü Entegrasyonu

#### Esnek API Tasarımı
Sistem, bir Flask API ile dış uygulamalara entegre edilebilir yapıdadır:

- **Mevcut Kullanıcılar İçin Öneriler**: Sistemde kayıtlı kullanıcılara öneriler sunma
- **Yeni Kullanıcılar İçin Öneriler**: Sistem dışı kullanıcılar için geçici profil oluşturarak öneriler sunma
- **Detaylı Açıklamalar**: Her öneri için neden bu önerinin yapıldığına dair detaylı açıklamalar

```python
@app.route('/api/recommend', methods=['POST'])
def recommend():
    # API endpoint kodu
```

## Neden Bu Teknikler Kullanıldı?

### Embedding + MLP Mimarisi
Klasik matris faktörizasyonu veya collaborative filtering yerine bu hibrit mimariyi seçmemizin sebepleri:

1. **Soğuk Başlama Problemi**: Geleneksel collaborative filtering, yeni kullanıcılar veya yeni oteller için iyi çalışmaz. Özellik tabanlı yaklaşımımız bu sorunu azaltır.

2. **Zengin Özellik Kullanımı**: Geleneksel yaklaşımlar sadece kullanıcı-ürün etkileşimlerine dayanırken, modelimiz bütçe, oda tipi, özellikler gibi zengin özellik setlerini kullanabilir.

3. **Doğrusal Olmayan İlişkileri Modelleme**: Derin sinir ağları, kullanıcı tercihleri ve otel özellikleri arasındaki karmaşık, doğrusal olmayan ilişkileri öğrenebilir.

### Dikkat Mekanizması
Dikkat mekanizması, modelin hangi özelliklerin daha önemli olduğunu öğrenmesini sağlar. Örneğin:
- Bazı kullanıcılar için fiyat çok önemliyken
- Diğerleri için oda tipi veya özellikler daha önemli olabilir

### Batch Normalization
Bu teknik:
1. Eğitimi hızlandırır
2. Daha yüksek öğrenme oranları kullanılmasına izin verir
3. Başlangıç ağırlıklarına daha az bağımlılık sağlar
4. Düzenleştirici etkisi ile aşırı öğrenmeyi azaltır

### Dropout
Dropout, modelin belirli nöronları rastgele devre dışı bırakarak:
1. Modelin daha genelleştirilebilir olmasını sağlar
2. Özniteliklerin birbirine aşırı bağımlılığını azaltır
3. Farklı öznitelikleri kullanan alt modellerin topluluk öğrenmesi gibi çalışmasını sağlar

### Adam Optimizer
SGD, RMSprop veya AdaGrad gibi diğer optimizasyon algoritmaları yerine Adam'ı seçtik çünkü:
1. Her parametre için adaptif öğrenme oranı sağlar
2. Momentum ve RMSprop'un avantajlarını birleştirir
3. Öğrenme oranı hiperparametresine daha az hassastır
4. Genellikle daha hızlı yakınsama sağlar

## Teknik Detaylar ve Hiperparametreler

### Model Parametreleri
- **Embedding Boyutu**: 64 (kullanıcı ve otel gizli vektörleri)
- **Gizli Katmanlar**: [128, 64, 32] (azalan boyut mimarisi)
- **Öğrenme Oranı**: 0.0005
- **Batch Boyutu**: 32
- **Epoch Sayısı**: 100 (early stopping ile)
- **Early Stopping Sabırsızlık Sınırı**: 15 epoch

### Veri Boyutları
- **Kullanıcı Özellikleri**: 12 boyutlu vektör
- **Otel Özellikleri**: 14 boyutlu vektör
- **Toplam Etkileşim Sayısı**: 760 sentetik etkileşim
- **Eğitim/Test Bölünmesi**: %80/%20

## Sonuç ve Gelecek Geliştirmeler

Bu proje, derin öğrenme tabanlı bir öneri sistemiyle kişiselleştirilmiş otel önerileri sunmayı başarmıştır. Kullanıcı tercihlerinin ve otel özelliklerinin çok boyutlu doğasını modelleyerek, her kullanıcıya özel öneriler sunabilen bir sistem geliştirilmiştir.

Gelecek geliştirmeler arasında:
- Gerçek kullanıcı davranışları üzerinden eğitim
- Sıralı öneri modelleri (sequence-based recommendation)
- Çok dilli açıklama üretimi
- Görsel özellik çıkarımı ile otel görselleri üzerinden özellik tespiti
- Mevsimsel ve coğrafi faktörlerin modele dahil edilmesi

Bu proje, yapay zeka ve derin öğrenme tekniklerinin turizm sektöründeki potansiyel uygulamalarına bir örnektir ve kullanıcı deneyimini önemli ölçüde iyileştirebilecek özelliklere sahiptir.