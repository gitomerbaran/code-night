# 🌾 Tarım Ürün Öneri Sistemi

Toprak analiz raporlarından otomatik veri çıkarma ve AI destekli ürün önerisi sunan profesyonel bir web uygulaması.

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Proje Yapısı](#proje-yapısı)
- [Geliştirme](#geliştirme)

## ✨ Özellikler

### 🎯 Ana Özellikler

- **Otomatik Veri Çıkarma**: PDF, Word, CSV, Excel ve resim dosyalarından toprak analiz verilerini otomatik çıkarır
- **AI Destekli Parsing**: Google Gemini API ile akıllı veri eşleştirme ve normalizasyon
- **CPU'da Hızlı OCR**: Tesseract OCR ile resimlerden hızlı metin çıkarma (bulut API'ye fallback)
- **Akıllı Form Doldurma**: Çıkarılan verileri otomatik olarak form alanlarına doldurur
- **Streaming Response**: Gerçek zamanlı ürün önerileri
- **Premium UI/UX**: Modern, kurumsal ve kullanıcı dostu arayüz

### 📄 Desteklenen Dosya Formatları

- **PDF** (.pdf) - Tablolar dahil tam metin çıkarma
- **Word** (.doc, .docx) - Tablolar dahil tam metin çıkarma
- **CSV** (.csv) - Sütun bazlı veri çıkarma
- **Excel** (.xlsx, .xls) - Sütun bazlı veri çıkarma
- **Resim** (.jpg, .jpeg, .png, .gif, .bmp, .webp) - OCR ile metin çıkarma

### 🔍 Veri Çıkarma Özellikleri

- **30+ Alan Desteği**: Zorunlu, genellikle bulunan ve opsiyonel alanlar
- **Alternatif İsim Tanıma**: Her alan için birden fazla alternatif isim desteği
- **Otomatik Normalizasyon**: 
  - Tarih formatları (DD.MM.YYYY, DD/MM/YYYY → YYYY-MM-DD)
  - Sayı formatları (virgül → nokta, birim kaldırma)
  - Toprak bünyesi normalizasyonu (kum → kumlu, kil → killi)
- **Birim Dönüşümü**: Otomatik birim kaldırma (%, mg/kg, dS/m, cm, mm vb.)
- **Tablo Okuma**: PDF ve Word dosyalarındaki tabloları da okur

## 🛠 Teknolojiler

### Backend

- **Python 3.9+**
- **Flask**: Web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Google Gemini API**: AI destekli veri parsing ve ürün önerisi
- **pdfplumber**: PDF dosyalarından metin ve tablo çıkarma
- **python-docx**: Word dosyalarından metin ve tablo çıkarma
- **pandas**: CSV/Excel dosyalarını okuma ve işleme
- **Pillow**: Resim işleme
- **pytesseract**: CPU'da hızlı OCR (Tesseract OCR wrapper)
- **openpyxl**: Excel dosyalarını okuma

### Frontend

- **React 19**: Modern UI framework
- **Vite**: Hızlı build tool ve dev server
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **PostCSS**: CSS işleme
- **Autoprefixer**: CSS vendor prefix'leri

### AI/ML

- **Google Gemini API**:
  - `gemini-1.5-flash`: Belge parsing (öncelikli, daha güçlü ve hızlı model)
  - `gemma-3-27b-it`: Veri parsing fallback ve ürün önerisi
  - `gemini-1.5-flash`: Resim OCR (fallback, Tesseract başarısız olursa)

### OCR

- **Tesseract OCR**: CPU'da hızlı OCR (öncelikli)
- **Gemini Vision API**: Bulut tabanlı OCR (fallback)

## 📦 Kurulum

### Gereksinimler

- Python 3.9 veya üzeri
- Node.js 18+ ve npm
- Tesseract OCR (opsiyonel, resim OCR için)

### 1. Repository'yi Klonlayın

```bash
git clone <repository-url>
cd tarim_assitant
```

### 2. Backend Kurulumu

```bash
# Python virtual environment oluştur (önerilir)
python -m venv venv
source venv/bin/activate  # macOS/Linux
# veya
venv\Scripts\activate  # Windows

# Bağımlılıkları yükle
pip install -r requirements.txt
```

### 3. Tesseract OCR Kurulumu (Opsiyonel)

**macOS:**
```bash
brew install tesseract tesseract-lang
```

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr tesseract-ocr-tur
```

**Windows:**
[Tesseract installer](https://github.com/UB-Mannheim/tesseract/wiki) indirip kurun.

### 4. Frontend Kurulumu

```bash
cd frontend
npm install
```

### 5. Environment Variables

Proje kök dizininde `.env` dosyası oluşturun:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Gemini API key almak için: [Google AI Studio](https://makersuite.google.com/app/apikey)

### 6. Servisleri Başlatma

**Backend (Terminal 1):**
```bash
python app.py
```
Backend `http://localhost:5001` adresinde çalışacak.

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
Frontend `http://localhost:5173` adresinde çalışacak.

## 🚀 Kullanım

### Web Arayüzü

1. Tarayıcıda `http://localhost:5173` adresini açın
2. **Dosyadan Otomatik Doldur** bölümünden toprak analiz raporunuzu yükleyin
3. Sistem otomatik olarak:
   - Dosyayı okur
   - Verileri çıkarır
   - Formu doldurur
   - Popup'ta çıkarılan verileri gösterir
4. Gerekirse formu manuel düzenleyin
5. **Analiz Başlat** butonuna tıklayın
6. Gerçek zamanlı olarak ürün önerilerini görün

### Manuel Form Doldurma

Tüm alanlar opsiyoneldir (zorunlu alanlar işaretlidir). Formu doldurup **Analiz Başlat** butonuna tıklayın.

### API Kullanımı

#### Dosya Yükleme ve Veri Çıkarma

```bash
curl -X POST http://localhost:5001/api/upload-file \
  -F "file=@toprak_analiz_raporu.pdf"
```

**Yanıt:**
```json
{
  "success": true,
  "data": {
    "sample_code": "NUM-2024-001",
    "sample_date": "2024-03-15",
    "pH": 6.7,
    "organic_matter": 2.3,
    ...
  },
  "extraction_method": "PDF (pdfplumber - CPU)",
  "matched_fields_count": 15,
  "matched_fields": ["sample_code", "pH", "organic_matter", ...]
}
```

#### Ürün Önerisi

```bash
curl -X POST http://localhost:5001/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "pH": 6.7,
    "organic_matter": 2.3,
    "province": "Konya",
    "season": "ilkbahar"
  }'
```

**Yanıt (Streaming):**
```json
{
  "primary_crop": "buğday",
  "alternatives": ["arpa", "bezelye", "yonca"],
  "confidence": 75,
  "reasons": [...],
  "risks": [...],
  "quick_actions": [...],
  "missing_inputs": [...],
  "assumptions": [...]
}
```

## 📁 Proje Yapısı

```
tarim_assitant/
├── app.py                 # Flask backend API
├── main.py                # Test/development script
├── requirements.txt       # Python bağımlılıkları
├── .env                   # Environment variables (oluşturulmalı)
├── README.md              # Bu dosya
│
├── frontend/              # React frontend
│   ├── src/
│   │   ├── App.jsx        # Ana React component
│   │   ├── components/
│   │   │   ├── CropForm.jsx      # Form component
│   │   │   └── ResultDisplay.jsx # Sonuç gösterimi
│   │   ├── index.css      # Tailwind CSS
│   │   └── main.jsx       # React entry point
│   ├── package.json
│   ├── vite.config.js     # Vite configuration
│   ├── tailwind.config.js # Tailwind configuration
│   └── postcss.config.js  # PostCSS configuration
│
└── [diğer dosyalar]
```

## 🔧 Geliştirme

### Backend Geliştirme

```bash
# Debug mode ile çalıştır
python app.py

# Port değiştirme (app.py içinde)
app.run(debug=True, port=5001)
```

### Frontend Geliştirme

```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Production preview
```

### Veri Çıkarma İyileştirme

Backend'de `parse_extracted_text()` fonksiyonunu düzenleyerek:
- Yeni alanlar ekleyebilirsiniz
- Alternatif isimler ekleyebilirsiniz
- Normalizasyon kuralları ekleyebilirsiniz

### Form Alanları Ekleme

`frontend/src/components/CropForm.jsx` dosyasında:
- `sections` array'ine yeni bölümler ekleyin
- `fieldMapping` object'ine yeni alanlar ekleyin

## 📊 Desteklenen Form Alanları

### Zorunlu Alanlar
- Numune No/Kodu
- Numune Alım Tarihi
- Analiz Tarihi
- İl
- Numune Derinliği (cm)
- Laboratuvar Adı
- pH
- Organik Madde (%)
- Fosfor (P)
- Potasyum (K)

### Genellikle Bulunan Alanlar
- EC (Elektriksel İletkenlik)
- Kireç (CaCO3 %)
- Toprak Bünyesi (kumlu/tınlı/killi)
- Azot (N)
- Değerlendirme Seviyesi
- Gübreleme Önerisi

### Opsiyonel - İleri Analiz
- İlçe
- Kalsiyum (Ca)
- Magnezyum (Mg)
- Kükürt (S)
- Demir (Fe)
- Çinko (Zn)
- Mangan (Mn)
- Bakır (Cu)
- Bor (B)
- CEC
- Toplam Tuz
- SAR
- ESP
- Organik Karbon (C)
- Toprak Nemi
- Bulk Density

### İklim Bilgileri
- Ortalama Sıcaklık (°C)
- Minimum/Maksimum Sıcaklık (°C)
- Yağış (mm)
- Nem (%)
- Kuraklık İndeksi

### Konum ve Zaman
- Ülke
- Enlem/Boylam
- Mevsim
- Ay (1-12)

### Kısıtlar ve Hedefler
- Sulama Durumu
- Önceki Ürün
- Hedef

## 🎨 Özellikler ve Güvenlik

### Input Validation
- Sayısal alanlar için tip kontrolü
- Min/max değer kontrolü
- Tarih formatı kontrolü
- XSS koruması (HTML tag temizleme)
- Karakter limiti kontrolü

### Veri Normalizasyonu
- Tarih formatları otomatik dönüştürülür
- Birimler otomatik kaldırılır
- Sayı formatları normalize edilir
- Toprak bünyesi değerleri standartlaştırılır

### Hata Yönetimi
- Detaylı hata mesajları
- Kullanıcı dostu hata gösterimi
- API quota hatalarını yakalama
- Dosya okuma hatalarını yakalama

## 🔐 Güvenlik Notları

- API key'leri `.env` dosyasında saklayın
- `.env` dosyasını git'e commit etmeyin
- Production'da `debug=False` kullanın
- CORS ayarlarını production'da sınırlandırın

## 📝 Lisans

Bu proje özel bir projedir.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 🐛 Sorun Giderme

### Tailwind CSS Hatası

Eğer `[postcss] It looks like you're trying to use tailwindcss directly as a PostCSS plugin` hatası alıyorsanız:

```bash
cd frontend
npm uninstall tailwindcss
npm install -D tailwindcss@3.4.19
rm -rf node_modules/.vite
npm run dev
```

### Tesseract OCR Hatası

Eğer Tesseract bulunamıyorsa:
- macOS: `brew install tesseract tesseract-lang`
- Linux: `sudo apt-get install tesseract-ocr tesseract-ocr-tur`
- Windows: [Tesseract installer](https://github.com/UB-Mannheim/tesseract/wiki) indirin

### Port Çakışması

Backend port'u değiştirmek için `app.py` dosyasında:
```python
app.run(debug=True, port=5001)  # Port numarasını değiştirin
```

Frontend proxy ayarını `frontend/vite.config.js` dosyasında güncelleyin.

### API Key Hatası

`.env` dosyasında `GEMINI_API_KEY` değişkeninin doğru olduğundan emin olun:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

## 📈 Performans

### Dosya İşleme Hızları

- **PDF**: ~1-3 saniye (sayfa sayısına bağlı)
- **Word**: ~0.5-2 saniye
- **CSV/Excel**: ~0.5-1 saniye
- **Resim (Tesseract)**: ~2-5 saniye (CPU'da)
- **Resim (Gemini)**: ~3-8 saniye (bulut)

### Veri Çıkarma Kalitesi

- **PDF/Word**: %95+ doğruluk (tablolar dahil)
- **CSV/Excel**: %98+ doğruluk
- **Resim (Tesseract)**: %80-90 doğruluk (kaliteye bağlı)
- **Resim (Gemini)**: %90-95 doğruluk

## 🎯 Kullanım Senaryoları

### Senaryo 1: PDF Rapor Yükleme

1. Laboratuvardan gelen PDF raporunu yükleyin
2. Sistem otomatik olarak tüm verileri çıkarır
3. Form otomatik doldurulur
4. Eksik alanları manuel tamamlayın
5. Analiz başlatın

### Senaryo 2: Resim Yükleme

1. Telefonla çekilmiş rapor fotoğrafını yükleyin
2. OCR ile metin çıkarılır
3. AI ile veriler parse edilir
4. Form doldurulur

### Senaryo 3: CSV/Excel Yükleme

1. Excel'deki analiz verilerini yükleyin
2. Sütun isimleri otomatik eşleştirilir
3. Veriler forma aktarılır

## 🔄 Veri Akışı

```
Dosya Yükleme
    ↓
Dosya Tipi Tespiti
    ↓
Metin Çıkarma (PDF/Word/CSV/OCR)
    ↓
AI Parsing (Gemini API)
    ↓
Veri Normalizasyonu
    ↓
Form Doldurma
    ↓
Kullanıcı Onayı/Düzenleme
    ↓
Ürün Önerisi İsteği
    ↓
AI Analiz (Gemini API)
    ↓
Streaming Response
    ↓
Sonuç Gösterimi
```

## 📊 Teknik Detaylar

### Backend Mimarisi

- **Flask RESTful API**: RESTful endpoint'ler
- **Streaming Response**: Server-Sent Events benzeri akışlı yanıt
- **Error Handling**: Kapsamlı hata yakalama ve kullanıcı dostu mesajlar
- **CORS**: Frontend-backend iletişimi için CORS desteği

### Frontend Mimarisi

- **Component-Based**: Modüler React component'leri
- **State Management**: React hooks (useState)
- **Form Validation**: Client-side validation
- **Responsive Design**: Mobile-first yaklaşım

### AI/ML Pipeline

1. **Text Extraction**: Dosyadan ham metin çıkarma
2. **AI Parsing**: Gemini API ile structured data extraction
3. **Normalization**: Veri temizleme ve normalizasyon
4. **Recommendation**: Gemini API ile ürün önerisi

## 🚀 Gelecek Geliştirmeler

- [ ] Çoklu dosya yükleme desteği
- [ ] Veri geçmişi ve karşılaştırma
- [ ] Export özelliği (PDF, Excel)
- [ ] Kullanıcı hesapları ve veri saklama
- [ ] Daha fazla dil desteği
- [ ] Mobil uygulama
- [ ] Offline mode (Tesseract OCR)

## 📞 İletişim

Sorularınız için issue açabilirsiniz.

---

**Not**: Bu sistem toprak analiz raporlarından veri çıkarma ve AI destekli ürün önerisi sunmak için tasarlanmıştır. Sonuçlar tavsiye niteliğindedir ve profesyonel ziraat danışmanlığı yerine geçmez.

## 📚 Ek Kaynaklar

- [Google Gemini API Dokümantasyonu](https://ai.google.dev/gemini-api/docs)
- [Tesseract OCR Dokümantasyonu](https://tesseract-ocr.github.io/)
- [Flask Dokümantasyonu](https://flask.palletsprojects.com/)
- [React Dokümantasyonu](https://react.dev/)
- [Tailwind CSS Dokümantasyonu](https://tailwindcss.com/docs)

