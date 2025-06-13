import os
import torch
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.manifold import TSNE
import pandas as pd
from improved_recommendation import ImprovedLearningRecommender
import json
from collections import Counter

# Stil ayarları
plt.style.use('ggplot')
sns.set(style="whitegrid")
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 12

# Dosya yolları
USERS_FILE = 'datas/expanded_users.json'
HOTELS_FILE = 'datas/expanded_hotels.json'
MODEL_PATH = 'improved_hotel_recommender_model.pth'
RESULTS_DIR = 'evaluation_results'

# Sonuç dizini oluştur
os.makedirs(RESULTS_DIR, exist_ok=True)

def load_recommender():
    """Öneri sistemini yükler"""
    print("Öneri sistemi yükleniyor...")
    
    # Genişletilmiş veri setini kullan veya varsayılan dosyaları kullan
    users_file = USERS_FILE if os.path.exists(USERS_FILE) else 'datas/mock_users.json'
    hotels_file = HOTELS_FILE if os.path.exists(HOTELS_FILE) else 'datas/mock_nevsehir_hotels.json'
    
    print(f"Kullanılan veri setleri: {users_file}, {hotels_file}")
    
    # Öneri sistemini başlat
    recommender = ImprovedLearningRecommender(users_file, hotels_file, MODEL_PATH)
    return recommender

def evaluate_model_detailed(recommender):
    """Modeli detaylı olarak değerlendirir ve sonuçları kaydeder"""
    print("\n" + "="*60)
    print("DETAYLI MODEL DEĞERLENDİRMESİ")
    print("="*60)
    
    # Model değerlendirme moduna al
    recommender.model.eval()
    test_data = recommender.dataset.get_test_data()
    
    # Tahminler ve gerçek değerleri topla
    all_predictions = []
    all_targets = []
    all_users = []
    all_hotels = []
    
    print(f"Test veri kümesi büyüklüğü: {len(test_data)} örnek")
    
    with torch.no_grad():
        for sample in test_data:
            user_idx = sample['user_idx'].to(recommender.dataset.device)
            hotel_idx = sample['hotel_idx'].to(recommender.dataset.device)
            user_features = sample['user_features'].to(recommender.dataset.device)
            hotel_features = sample['hotel_features'].to(recommender.dataset.device)
            rating = sample['rating'].to(recommender.dataset.device)
            
            # Tahmin yap
            prediction = recommender.model(
                user_idx.unsqueeze(0), 
                hotel_idx.unsqueeze(0), 
                user_features.unsqueeze(0), 
                hotel_features.unsqueeze(0)
            )
            
            all_predictions.append(prediction.item())
            all_targets.append(rating.item())
            all_users.append(user_idx.item())
            all_hotels.append(hotel_idx.item())
    
    # NumPy dizileri oluştur
    predictions = np.array(all_predictions)
    targets = np.array(all_targets)
    users = np.array(all_users)
    hotels = np.array(all_hotels)
    
    # Temel metrikler
    mse = mean_squared_error(targets, predictions)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(targets, predictions)
    r2 = r2_score(targets, predictions)
    
    # Tolerans içindeki tahminlerin oranı
    tolerance_levels = [0.25, 0.5, 0.75, 1.0]
    within_tolerance = {}
    for tol in tolerance_levels:
        within_tol = np.mean(np.abs(predictions - targets) <= tol)
        within_tolerance[tol] = within_tol
    
    # Sonuçları yazdır
    print("\nTemel Performans Metrikleri:")
    print(f"MSE (Ortalama Kare Hata): {mse:.4f}")
    print(f"RMSE (Kök Ortalama Kare Hata): {rmse:.4f}")
    print(f"MAE (Ortalama Mutlak Hata): {mae:.4f}")
    print(f"R2 Skoru: {r2:.4f}")
    
    print("\nTolerans İçindeki Tahminler:")
    for tol, ratio in within_tolerance.items():
        print(f"± {tol:.2f} puan içinde: {ratio*100:.2f}%")
    
    # Sonuçları dosyaya kaydet
    metrics = {
        'mse': mse,
        'rmse': rmse,
        'mae': mae,
        'r2': r2,
        'within_tolerance': within_tolerance
    }
    
    with open(f"{RESULTS_DIR}/performance_metrics.json", 'w') as f:
        json.dump(metrics, f, indent=4)
    
    print(f"\nPerformans metrikleri {RESULTS_DIR}/performance_metrics.json dosyasına kaydedildi.")
    
    # Detaylı analizlere devam et
    plot_prediction_vs_target(predictions, targets)
    plot_error_distribution(predictions, targets)
    plot_error_by_rating(predictions, targets)
    plot_user_hotel_distribution(users, hotels, recommender)
    
    return metrics

def plot_prediction_vs_target(predictions, targets):
    """Tahmin edilen ve gerçek değerleri karşılaştıran grafik oluşturur"""
    plt.figure(figsize=(12, 10))
    
    # Ana scatter plot
    plt.scatter(targets, predictions, alpha=0.5, color='blue', label='Tahminler')
    
    # Mükemmel tahmin çizgisi
    min_val = min(min(targets), min(predictions))
    max_val = max(max(targets), max(predictions))
    plt.plot([min_val, max_val], [min_val, max_val], 'r--', label='Mükemmel Tahmin')
    
    # ±0.5 tolerans aralığı
    tolerance = 0.5
    x = np.linspace(min_val, max_val, 100)
    plt.fill_between(x, x - tolerance, x + tolerance, alpha=0.2, color='green', label=f'±{tolerance} Tolerans')
    
    # Lineer regresyon çizgisi
    z = np.polyfit(targets, predictions, 1)
    p = np.poly1d(z)
    plt.plot(np.sort(targets), p(np.sort(targets)), "b-", alpha=0.7, label='Trend Çizgisi')
    
    # Grafiği güzelleştir
    plt.grid(True, alpha=0.3)
    plt.xlabel('Gerçek Değerler')
    plt.ylabel('Tahmin Edilen Değerler')
    plt.title('Tahmin vs Gerçek Değerler Karşılaştırması')
    plt.legend()
    
    # Metrikleri grafiğe ekle
    mse = mean_squared_error(targets, predictions)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(targets, predictions)
    r2 = r2_score(targets, predictions)
    
    plt.annotate(f'RMSE: {rmse:.4f}\nMAE: {mae:.4f}\nR²: {r2:.4f}',
                xy=(0.05, 0.95), xycoords='axes fraction',
                bbox=dict(boxstyle="round,pad=0.3", fc="white", ec="gray", alpha=0.8))
    
    # Kaydet ve göster
    plt.tight_layout()
    plt.savefig(f"{RESULTS_DIR}/predictions_vs_targets_detailed.png")
    print(f"Tahmin vs Gerçek grafiği {RESULTS_DIR}/predictions_vs_targets_detailed.png dosyasına kaydedildi.")

def plot_error_distribution(predictions, targets):
    """Tahmin hatalarının dağılımını gösteren histogram"""
    errors = predictions - targets
    
    plt.figure(figsize=(12, 8))
    
    # Ana histogram
    sns.histplot(errors, kde=True, bins=30)
    
    # İstatistikler
    mean_error = np.mean(errors)
    std_error = np.std(errors)
    
    # Grafiği güzelleştir
    plt.axvline(x=0, color='r', linestyle='--', alpha=0.7, label='Sıfır Hata')
    plt.axvline(x=mean_error, color='g', linestyle='-', alpha=0.7, label=f'Ortalama Hata: {mean_error:.4f}')
    
    plt.grid(True, alpha=0.3)
    plt.xlabel('Tahmin Hatası (Tahmin - Gerçek)')
    plt.ylabel('Frekans')
    plt.title('Tahmin Hatası Dağılımı')
    plt.legend()
    
    # İstatistikleri grafiğe ekle
    plt.annotate(f'Ortalama Hata: {mean_error:.4f}\nStandart Sapma: {std_error:.4f}',
                xy=(0.05, 0.95), xycoords='axes fraction',
                bbox=dict(boxstyle="round,pad=0.3", fc="white", ec="gray", alpha=0.8))
    
    # Kaydet
    plt.tight_layout()
    plt.savefig(f"{RESULTS_DIR}/error_distribution.png")
    print(f"Hata dağılımı grafiği {RESULTS_DIR}/error_distribution.png dosyasına kaydedildi.")

def plot_error_by_rating(predictions, targets):
    """Gerçek puanlara göre hata dağılımını gösteren kutu grafiği"""
    # Verileri DataFrame'e dönüştür
    df = pd.DataFrame({
        'Actual': targets,
        'Predicted': predictions,
        'Error': predictions - targets
    })
    
    # Puanları yuvarlayarak kategorilere ayır
    df['Rating_Category'] = np.round(df['Actual']).astype(int)
    
    plt.figure(figsize=(14, 8))
    
    # Kutu grafiği çiz
    sns.boxplot(x='Rating_Category', y='Error', data=df)
    
    # Sıfır çizgisi ekle
    plt.axhline(y=0, color='r', linestyle='--', alpha=0.7)
    
    # Grafiği güzelleştir
    plt.grid(True, alpha=0.3)
    plt.xlabel('Gerçek Puan (Yuvarlak)')
    plt.ylabel('Tahmin Hatası')
    plt.title('Puan Kategorilerine Göre Tahmin Hatası Dağılımı')
    
    # Her kategori için örnek sayısını göster
    counts = df['Rating_Category'].value_counts().sort_index()
    categories = sorted(df['Rating_Category'].unique())
    
    for i, category in enumerate(categories):
        count = counts.get(category, 0)
        plt.annotate(f'n={count}', xy=(i, df['Error'].min() + 0.1), 
                    ha='center', va='bottom', color='black', fontweight='bold')
    
    # Kaydet
    plt.tight_layout()
    plt.savefig(f"{RESULTS_DIR}/error_by_rating.png")
    print(f"Puan kategorilerine göre hata grafiği {RESULTS_DIR}/error_by_rating.png dosyasına kaydedildi.")

def plot_user_hotel_distribution(users, hotels, recommender):
    """Kullanıcı ve otel dağılımlarını gösteren grafikler"""
    # Kullanıcı ve otel ID'lerini gerçek ID'lere dönüştür
    user_indices = np.unique(users)
    hotel_indices = np.unique(hotels)
    
    user_ids = [recommender.dataset.user_ids[idx] for idx in user_indices]
    hotel_ids = [recommender.dataset.hotel_ids[idx] for idx in hotel_indices]
    
    # Veri setindeki toplam kullanıcı ve otel sayısı
    total_users = recommender.dataset.num_users
    total_hotels = recommender.dataset.num_hotels
    
    # Test kümesindeki kullanıcı ve otel yüzdeleri
    user_coverage = len(user_indices) / total_users * 100
    hotel_coverage = len(hotel_indices) / total_hotels * 100
    
    # Kullanıcı ve otel sıklıklarını hesapla
    user_counts = Counter([recommender.dataset.user_ids[u] for u in users])
    hotel_counts = Counter([recommender.dataset.hotel_ids[h] for h in hotels])
    
    # Veri setindeki kullanıcı ve otel dağılımını görselleştir
    plt.figure(figsize=(14, 7))
    
    plt.subplot(1, 2, 1)
    most_common_users = user_counts.most_common(10)
    user_labels = [f"Kullanıcı {uid}" for uid, _ in most_common_users]
    user_values = [count for _, count in most_common_users]
    
    plt.bar(user_labels, user_values, color='skyblue')
    plt.xticks(rotation=45, ha='right')
    plt.title(f'En Çok Test Edilen 10 Kullanıcı (Toplam: {len(user_indices)}/{total_users})')
    plt.tight_layout()
    
    plt.subplot(1, 2, 2)
    most_common_hotels = hotel_counts.most_common(10)
    hotel_labels = [f"Otel {hid}" for hid, _ in most_common_hotels]
    hotel_values = [count for _, count in most_common_hotels]
    
    plt.bar(hotel_labels, hotel_values, color='salmon')
    plt.xticks(rotation=45, ha='right')
    plt.title(f'En Çok Test Edilen 10 Otel (Toplam: {len(hotel_indices)}/{total_hotels})')
    
    plt.tight_layout()
    plt.savefig(f"{RESULTS_DIR}/user_hotel_distribution.png")
    print(f"Kullanıcı-Otel dağılım grafiği {RESULTS_DIR}/user_hotel_distribution.png dosyasına kaydedildi.")
    
    # Kapsama raporu
    coverage_info = {
        "total_users": total_users,
        "users_in_test": len(user_indices),
        "user_coverage_percent": user_coverage,
        "total_hotels": total_hotels,
        "hotels_in_test": len(hotel_indices),
        "hotel_coverage_percent": hotel_coverage
    }
    
    with open(f"{RESULTS_DIR}/coverage_report.json", 'w') as f:
        json.dump(coverage_info, f, indent=4)
    
    print(f"Kapsama raporu {RESULTS_DIR}/coverage_report.json dosyasına kaydedildi.")
    print(f"Test kümesinde kullanıcıların %{user_coverage:.2f}'i ve otellerin %{hotel_coverage:.2f}'i temsil ediliyor.")

def generate_sample_recommendations(recommender, num_users=3):
    """Örnek kullanıcılar için önerileri oluşturur ve detaylı sonuçları kaydeder"""
    print("\n" + "="*60)
    print("ÖRNEK ÖNERİLER ANALİZİ")
    print("="*60)
    
    # Test edilecek kullanıcıları belirle
    # Burada varsayılan ilk n kullanıcıyı kullanabiliriz ya da rastgele seçebiliriz
    with open(recommender.dataset.users_file, 'r', encoding='utf-8') as f:
        users = json.load(f)
    
    if len(users) > num_users:
        # İlk num_users kadar kullanıcıyı seç
        test_users = users[:num_users]
    else:
        test_users = users
    
    # Her kullanıcı için öneriler oluştur
    all_recommendations = {}
    
    for user in test_users:
        user_id = user['id']
        print(f"\nKullanıcı ID: {user_id}, İsim: {user['name']} için öneriler oluşturuluyor...")
        
        # Önerileri al
        recommendations = recommender.recommend_hotels(user_id, top_n=5, debug=True)
        
        # Her öneri için detaylı açıklama ekle
        for rec in recommendations:
            explanation = recommender.explain_recommendation(user_id, rec['hotel_id'])
            if explanation and "error" not in explanation:
                rec['detailed_explanation'] = explanation
        
        all_recommendations[user_id] = {
            "user_info": {
                "name": user['name'],
                "budget": user['preferredBudget'],
                "preferred_room_type": user['preferredRoomType'],
                "required_capacity": user['requiredCapacity'],
                "preferred_amenities": user['preferredAmenities']
            },
            "recommendations": recommendations
        }
    
    # Sonuçları JSON olarak kaydet
    with open(f"{RESULTS_DIR}/sample_recommendations.json", 'w', encoding='utf-8') as f:
        json.dump(all_recommendations, f, ensure_ascii=False, indent=4)
    
    print(f"Örnek öneriler {RESULTS_DIR}/sample_recommendations.json dosyasına kaydedildi.")
    
    # Öneri puanlarının dağılımını görselleştir
    visualize_recommendation_scores(all_recommendations)
    
    return all_recommendations

def visualize_recommendation_scores(recommendations):
    """Öneri puanlarının dağılımını görselleştirir"""
    # Tüm önerileri düzleştir
    all_scores = []
    user_scores = {}
    
    for user_id, data in recommendations.items():
        user_name = data['user_info']['name']
        scores = [rec['predicted_rating'] for rec in data['recommendations']]
        all_scores.extend(scores)
        user_scores[user_name] = scores
    
    # Genel puan dağılımı
    plt.figure(figsize=(12, 8))
    sns.histplot(all_scores, kde=True, bins=20)
    plt.axvline(x=np.mean(all_scores), color='r', linestyle='--', label=f'Ortalama: {np.mean(all_scores):.2f}')
    
    plt.xlabel('Tahmini Puan')
    plt.ylabel('Frekans')
    plt.title('Öneri Puanlarının Dağılımı')
    plt.legend()
    
    plt.savefig(f"{RESULTS_DIR}/recommendation_score_distribution.png")
    print(f"Öneri puanları dağılımı {RESULTS_DIR}/recommendation_score_distribution.png dosyasına kaydedildi.")
    
    # Kullanıcı bazında puan dağılımı
    plt.figure(figsize=(14, 8))
    
    data = []
    for user, scores in user_scores.items():
        for score in scores:
            data.append({'Kullanıcı': user, 'Tahmini Puan': score})
    
    df = pd.DataFrame(data)
    
    sns.boxplot(x='Kullanıcı', y='Tahmini Puan', data=df)
    plt.xticks(rotation=45, ha='right')
    plt.title('Kullanıcı Bazında Öneri Puanları')
    plt.tight_layout()
    
    plt.savefig(f"{RESULTS_DIR}/user_recommendation_scores.png")
    print(f"Kullanıcı bazında öneri puanları {RESULTS_DIR}/user_recommendation_scores.png dosyasına kaydedildi.")

def generate_evaluation_report():
    """Tüm değerlendirme sonuçlarını içeren bir özet rapor oluşturur"""
    # Tüm JSON sonuçlarını oku
    metrics_file = f"{RESULTS_DIR}/performance_metrics.json"
    coverage_file = f"{RESULTS_DIR}/coverage_report.json"
    
    if not os.path.exists(metrics_file) or not os.path.exists(coverage_file):
        print("Rapor oluşturmak için önce değerlendirme yapın.")
        return
    
    with open(metrics_file, 'r') as f:
        metrics = json.load(f)
    
    with open(coverage_file, 'r') as f:
        coverage = json.load(f)
    
    # HTML rapor oluştur
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Model Değerlendirme Raporu</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            h1, h2 {{ color: #2c3e50; }}
            .container {{ max-width: 1200px; margin: 0 auto; }}
            .section {{ margin-bottom: 30px; }}
            .metrics {{ display: flex; flex-wrap: wrap; }}
            .metric-card {{ 
                background-color: #f8f9fa; 
                border-radius: 5px; 
                padding: 15px; 
                margin: 10px; 
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                flex: 1;
                min-width: 200px;
            }}
            .metric-value {{ font-size: 24px; font-weight: bold; color: #3498db; }}
            .metric-name {{ font-size: 14px; color: #7f8c8d; }}
            .gallery {{ display: flex; flex-wrap: wrap; justify-content: center; }}
            .image-container {{ margin: 10px; text-align: center; }}
            img {{ max-width: 100%; border-radius: 5px; box-shadow: 0 3px 10px rgba(0,0,0,0.2); }}
            .image-caption {{ margin-top: 5px; font-size: 14px; color: #34495e; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Derin Öğrenme Otel Öneri Sistemi Değerlendirme Raporu</h1>
            
            <div class="section">
                <h2>Performans Metrikleri</h2>
                <div class="metrics">
                    <div class="metric-card">
                        <div class="metric-value">{metrics['rmse']:.4f}</div>
                        <div class="metric-name">RMSE (Kök Ortalama Kare Hata)</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{metrics['mae']:.4f}</div>
                        <div class="metric-name">MAE (Ortalama Mutlak Hata)</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{metrics['r2']:.4f}</div>
                        <div class="metric-name">R² Skoru</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{metrics['within_tolerance']["0.5"]*100:.2f}%</div>
                        <div class="metric-name">±0.5 Puan Tolerans İçindeki Tahminler</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>Veri Seti Kapsama Bilgileri</h2>
                <div class="metrics">
                    <div class="metric-card">
                        <div class="metric-value">{coverage['user_coverage_percent']:.2f}%</div>
                        <div class="metric-name">Kullanıcı Kapsama Oranı</div>
                        <div>({coverage['users_in_test']}/{coverage['total_users']} kullanıcı)</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{coverage['hotel_coverage_percent']:.2f}%</div>
                        <div class="metric-name">Otel Kapsama Oranı</div>
                        <div>({coverage['hotels_in_test']}/{coverage['total_hotels']} otel)</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>Görselleştirmeler</h2>
                <div class="gallery">
                    <div class="image-container">
                        <img src="predictions_vs_targets_detailed.png" alt="Tahmin vs Gerçek Değerler">
                        <div class="image-caption">Tahmin vs Gerçek Değerler Karşılaştırması</div>
                    </div>
                    <div class="image-container">
                        <img src="error_distribution.png" alt="Hata Dağılımı">
                        <div class="image-caption">Tahmin Hatası Dağılımı</div>
                    </div>
                    <div class="image-container">
                        <img src="error_by_rating.png" alt="Puan Kategorilerine Göre Hata">
                        <div class="image-caption">Puan Kategorilerine Göre Tahmin Hatası</div>
                    </div>
                    <div class="image-container">
                        <img src="user_hotel_distribution.png" alt="Kullanıcı-Otel Dağılımı">
                        <div class="image-caption">Kullanıcı ve Otel Dağılımı</div>
                    </div>
                    <div class="image-container">
                        <img src="recommendation_score_distribution.png" alt="Öneri Puanları Dağılımı">
                        <div class="image-caption">Öneri Puanlarının Dağılımı</div>
                    </div>
                    <div class="image-container">
                        <img src="user_recommendation_scores.png" alt="Kullanıcı Bazında Öneri Puanları">
                        <div class="image-caption">Kullanıcı Bazında Öneri Puanları</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>Sonuç</h2>
                <p>
                    Bu değerlendirme, derin öğrenme tabanlı otel öneri sistemimizin performansını göstermektedir.
                    RMSE değeri {metrics['rmse']:.4f} ve tahminlerin %{metrics['within_tolerance']["0.5"]*100:.2f}'i gerçek değerlerin ±0.5 puan içindedir,
                    bu da modelimizin kullanıcı tercihlerini oldukça iyi tahmin edebildiğini göstermektedir.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # HTML dosyasını kaydet
    with open(f"{RESULTS_DIR}/evaluation_report.html", 'w') as f:
        f.write(html_content)
    
    print(f"Değerlendirme raporu {RESULTS_DIR}/evaluation_report.html dosyasına kaydedildi.")

if __name__ == "__main__":
    print("Otel Öneri Sistemi Değerlendirme Aracı")
    print("="*60)
    
    # Öneri sistemini yükle
    recommender = load_recommender()
    
    # Detaylı değerlendirme
    metrics = evaluate_model_detailed(recommender)
    
    # Örnek öneriler oluştur
    recommendations = generate_sample_recommendations(recommender, num_users=3)
    
    # Özet rapor oluştur
    generate_evaluation_report()
    
    print("\n" + "="*60)
    print("DEĞERLENDİRME TAMAMLANDI")
    print(f"Tüm sonuçlar '{RESULTS_DIR}' dizinine kaydedildi.")
    print(f"Özet raporu görüntülemek için '{RESULTS_DIR}/evaluation_report.html' dosyasını tarayıcınızda açın.")
    print("="*60) 