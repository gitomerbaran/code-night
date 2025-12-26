import { useState, useEffect } from 'react';
import LocationMap from './LocationMap';

const CropForm = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        // ZORUNLU
        sample_code: '',
        sample_date: '',
        analysis_date: '',
        province: '',
        district: '',
        sample_depth: '',
        laboratory_name: '',
        pH: '',
        organic_matter: '',
        phosphorus_P: '',
        potassium_K: '',
        // GENELLİKLE OLUR
        ec: '',
        lime_caCO3: '',
        soil_texture: '',
        nitrogen_N: '',
        evaluation_level: '',
        fertilization_recommendation: '',
        // OPSİYONEL
        calcium_Ca: '',
        magnesium_Mg: '',
        sulfur_S: '',
        iron_Fe: '',
        zinc_Zn: '',
        manganese_Mn: '',
        copper_Cu: '',
        boron_B: '',
        cec: '',
        total_salt: '',
        sar: '',
        esp: '',
        organic_carbon_C: '',
        soil_moisture: '',
        bulk_density: '',
        // İklim (mevcut)
        avg_temp_c: '',
        min_temp_c: '',
        max_temp_c: '',
        rainfall_mm: '',
        humidity_pct: '',
        drought_index: '',
        // Konum (mevcut)
        country: 'Türkiye',
        lat: '',
        lon: '',
        season: 'ilkbahar',
        month: '',
        // Kısıtlar (mevcut)
        irrigation: 'orta',
        previous_crop: '',
        goal: '',
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [fileUploading, setFileUploading] = useState(false);
    const [fileUploadError, setFileUploadError] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [extractedData, setExtractedData] = useState(null);
    const [showDataPopup, setShowDataPopup] = useState(false);

    // Mod seçimi: 'manual', 'location-only', 'mixed'
    const [inputMode, setInputMode] = useState('manual');

    // Otomatik tarih ve mevsim belirleme
    const getCurrentDate = () => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    };

    const getCurrentMonth = () => {
        return new Date().getMonth() + 1;
    };

    const getSeasonFromMonth = (month) => {
        if (month >= 3 && month <= 5) return 'ilkbahar';
        if (month >= 6 && month <= 8) return 'yaz';
        if (month >= 9 && month <= 11) return 'sonbahar';
        return 'kış';
    };

    // Konum seçildiğinde otomatik tarih ve mevsim güncelle
    useEffect(() => {
        if (inputMode === 'location-only' || inputMode === 'mixed') {
            if (formData.lat && formData.lon) {
                const currentDate = getCurrentDate();
                const currentMonth = getCurrentMonth();
                const currentSeason = getSeasonFromMonth(currentMonth);

                setFormData(prev => ({
                    ...prev,
                    sample_date: prev.sample_date || currentDate,
                    analysis_date: prev.analysis_date || currentDate,
                    month: prev.month || currentMonth,
                    season: prev.season || currentSeason,
                }));
            }
        }
    }, [formData.lat, formData.lon, inputMode]);

    const handleLocationSelect = (lat, lon) => {
        setFormData(prev => ({
            ...prev,
            lat: lat.toString(),
            lon: lon.toString(),
        }));

        // Konum seçildiğinde otomatik tarih ve mevsim güncelle
        if (inputMode === 'location-only' || inputMode === 'mixed') {
            const currentDate = getCurrentDate();
            const currentMonth = getCurrentMonth();
            const currentSeason = getSeasonFromMonth(currentMonth);

            setFormData(prev => ({
                ...prev,
                sample_date: prev.sample_date || currentDate,
                analysis_date: prev.analysis_date || currentDate,
                month: prev.month || currentMonth,
                season: prev.season || currentSeason,
            }));
        }
    };

    const sanitizeInput = (value) => {
        if (typeof value !== 'string') return value;
        return value.replace(/<[^>]*>/g, '').trim();
    };

    const validateNumber = (value, fieldName, min, max, allowNegative = false) => {
        if (!value || value === '') return null;
        const trimmed = String(value).trim();
        if (trimmed === '') return null;
        // Sadece sayı, nokta ve eksi işareti kabul et
        if (!/^-?\d*\.?\d+$/.test(trimmed)) {
            return 'Sadece sayı girebilirsiniz';
        }
        const num = parseFloat(trimmed);
        if (isNaN(num)) return 'Geçerli bir sayı giriniz';
        if (!allowNegative && num < 0) return 'Negatif değer girilemez';
        if (min !== undefined && num < min) return `Minimum değer: ${min}`;
        if (max !== undefined && num > max) return `Maksimum değer: ${max}`;
        return null;
    };

    const validateText = (value, fieldName, maxLength = 100, required = false) => {
        if (required && (!value || value.trim() === '')) {
            return 'Bu alan zorunludur';
        }
        if (!value || value === '') return null;
        const sanitized = sanitizeInput(value);
        if (sanitized.length > maxLength) {
            return `Maksimum ${maxLength} karakter olabilir`;
        }
        return null;
    };

    const validateDate = (value, required = false) => {
        if (required && (!value || value === '')) {
            return 'Bu alan zorunludur';
        }
        if (!value || value === '') return null;
        // Date format kontrolü
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return 'Geçerli bir tarih giriniz';
        }
        return null;
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;

        // Input tipine göre işle
        let processedValue = value;
        if (type === 'number') {
            // Sayısal alanlarda sayı, nokta, virgül ve eksi işareti kabul et (virgüllü sayı desteği)
            // Virgülü noktaya çevir (2,5 -> 2.5)
            if (value.includes(',')) {
                processedValue = value.replace(',', '.');
            }
            // Geçerli sayı formatını kontrol et (nokta, virgül, eksi, sayılar)
            if (value && !/^-?\d*[.,]?\d*$/.test(value.replace(',', '.'))) {
                return; // Geçersiz karakter, değişikliği uygulama
            }
            // Eğer virgül varsa, noktaya çevirilmiş değeri kullan
            if (value.includes(',')) {
                processedValue = value.replace(',', '.');
            }
        } else {
            processedValue = sanitizeInput(value);
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
        setTouched(prev => ({ ...prev, [name]: true }));

        // Tüm alanlar opsiyonel - sadece doldurulmuş alanları validate et
        const requiredFields = {
            sample_code: { type: 'text', maxLength: 50 },
            sample_date: { type: 'date' },
            analysis_date: { type: 'date' },
            province: { type: 'text', maxLength: 50 },
            sample_depth: { type: 'number' },
            laboratory_name: { type: 'text', maxLength: 100 },
            pH: { type: 'number' },
            organic_matter: { type: 'number' },
            phosphorus_P: { type: 'number' },
            potassium_K: { type: 'number' },
        };

        // Opsiyonel sayısal alanlar - sınır yok, sadece sayı kontrolü
        const optionalNumberFields = [
            'calcium_Ca', 'magnesium_Mg', 'sulfur_S', 'iron_Fe', 'zinc_Zn', 'manganese_Mn',
            'copper_Cu', 'boron_B', 'cec', 'total_salt', 'sar', 'esp', 'organic_carbon_C',
            'soil_moisture', 'bulk_density', 'avg_temp_c', 'min_temp_c', 'max_temp_c',
            'rainfall_mm', 'humidity_pct', 'drought_index', 'lat', 'lon', 'month',
            'ec', 'lime_caCO3', 'nitrogen_N', 'sample_depth', 'pH', 'organic_matter',
            'phosphorus_P', 'potassium_K'
        ];

        // Validation
        if (requiredFields[name]) {
            const field = requiredFields[name];
            if (field.type === 'date') {
                const error = validateDate(processedValue, true);
                setErrors(prev => ({ ...prev, [name]: error || '' }));
            } else if (field.type === 'text') {
                const error = validateText(processedValue, name, field.maxLength, true);
                setErrors(prev => ({ ...prev, [name]: error || '' }));
            } else if (field.type === 'number') {
                const error = validateNumber(processedValue, name, field.min, field.max);
                setErrors(prev => ({ ...prev, [name]: error || '' }));
            }
        } else if (commonFields[name]) {
            const field = commonFields[name];
            if (field.type === 'number' && processedValue !== '') {
                const error = validateNumber(processedValue, name, field.min, field.max);
                setErrors(prev => ({ ...prev, [name]: error || '' }));
            } else {
                setErrors(prev => ({ ...prev, [name]: '' }));
            }
        } else if (optionalNumberFields[name]) {
            if (processedValue !== '') {
                const [min, max] = optionalNumberFields[name];
                const error = validateNumber(processedValue, name, min, max);
                setErrors(prev => ({ ...prev, [name]: error || '' }));
            } else {
                setErrors(prev => ({ ...prev, [name]: '' }));
            }
        } else if (['district', 'previous_crop', 'fertilization_recommendation'].includes(name)) {
            if (processedValue !== '') {
                const error = validateText(processedValue, name, 100);
                setErrors(prev => ({ ...prev, [name]: error || '' }));
            } else {
                setErrors(prev => ({ ...prev, [name]: '' }));
            }
        } else if (name === 'goal') {
            if (processedValue !== '') {
                const error = validateText(processedValue, name, 200);
                setErrors(prev => ({ ...prev, [name]: error || '' }));
            } else {
                setErrors(prev => ({ ...prev, [name]: '' }));
            }
        } else {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};

        // Tüm alanlar opsiyonel - sadece doldurulmuş alanları validate et

        // Diğer alanların validasyonu - sadece sayı kontrolü, sınır yok
        const numberFields = [
            'ec', 'lime_caCO3', 'nitrogen_N', 'calcium_Ca', 'magnesium_Mg', 'sulfur_S',
            'iron_Fe', 'zinc_Zn', 'manganese_Mn', 'copper_Cu', 'boron_B', 'cec',
            'total_salt', 'sar', 'esp', 'organic_carbon_C', 'soil_moisture', 'bulk_density',
            'avg_temp_c', 'min_temp_c', 'max_temp_c', 'rainfall_mm', 'humidity_pct',
            'drought_index', 'lat', 'lon', 'month', 'sample_depth', 'pH', 'organic_matter',
            'phosphorus_P', 'potassium_K'
        ];

        numberFields.forEach(key => {
            if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
                // Sadece sayı olup olmadığını kontrol et, sınır yok
                const numValue = parseFloat(String(formData[key]).replace(',', '.'));
                if (isNaN(numValue)) {
                    newErrors[key] = 'Geçerli bir sayı giriniz';
                }
            }
        });

        ['district', 'previous_crop', 'fertilization_recommendation'].forEach(key => {
            if (formData[key]) {
                const error = validateText(formData[key], key, 100);
                if (error) newErrors[key] = error;
            }
        });

        if (formData.goal) {
            const error = validateText(formData.goal, 'goal', 200);
            if (error) newErrors.goal = error;
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            const firstErrorField = Object.keys(newErrors)[0];
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
            }
            return;
        }

        // Prepare data
        const submitData = {};
        const allNumberFields = Object.keys(numberFields);

        Object.keys(formData).forEach(key => {
            if (formData[key] === '' || formData[key] === null || formData[key] === undefined) {
                submitData[key] = null;
            } else if (allNumberFields.includes(key) || ['pH', 'organic_matter', 'phosphorus_P', 'potassium_K', 'sample_depth'].includes(key)) {
                const num = parseFloat(String(formData[key]).trim());
                submitData[key] = isNaN(num) ? null : num;
            } else {
                submitData[key] = sanitizeInput(formData[key]);
            }
        });

        onSubmit(submitData);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Dosya tipi kontrolü
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/bmp',
            'image/webp'
        ];

        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|csv|xlsx|xls|jpg|jpeg|png|gif|bmp|webp)$/i)) {
            setFileUploadError('Desteklenmeyen dosya formatı. PDF, Word, CSV, Excel veya resim dosyası yükleyin.');
            return;
        }

        // Dosya boyutu kontrolü (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setFileUploadError('Dosya boyutu 10MB\'dan büyük olamaz.');
            return;
        }

        setFileUploading(true);
        setFileUploadError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload-file', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            // Başarılı veya başarısız, her durumda popup göster
            if (result.success && result.data) {
                // Çıkarılan verileri sakla
                const extracted = result.data;
                setExtractedData({
                    ...extracted,
                    _metadata: {
                        extraction_method: result.extraction_method || 'Bilinmiyor',
                        matched_fields_count: result.matched_fields_count || 0,
                        matched_fields: result.matched_fields || [],
                        file_name: file.name
                    }
                });
                setUploadedFile({
                    name: file.name,
                    size: file.size,
                    type: file.type
                });

                // Form verilerini güncelle (sadece null olmayan değerler)
                const updatedFormData = { ...formData };

                // Field mapping - backend'den gelen key'leri form field'larına map et
                const fieldMapping = {
                    'sample_code': 'sample_code',
                    'sample_date': 'sample_date',
                    'analysis_date': 'analysis_date',
                    'province': 'province',
                    'district': 'district',
                    'sample_depth': 'sample_depth',
                    'laboratory_name': 'laboratory_name',
                    'pH': 'pH',
                    'organic_matter': 'organic_matter',
                    'phosphorus_P': 'phosphorus_P',
                    'potassium_K': 'potassium_K',
                    'ec': 'ec',
                    'lime_caCO3': 'lime_caCO3',
                    'soil_texture': 'soil_texture',
                    'nitrogen_N': 'nitrogen_N',
                    'evaluation_level': 'evaluation_level',
                    'fertilization_recommendation': 'fertilization_recommendation',
                    'calcium_Ca': 'calcium_Ca',
                    'magnesium_Mg': 'magnesium_Mg',
                    'sulfur_S': 'sulfur_S',
                    'iron_Fe': 'iron_Fe',
                    'zinc_Zn': 'zinc_Zn',
                    'manganese_Mn': 'manganese_Mn',
                    'copper_Cu': 'copper_Cu',
                    'boron_B': 'boron_B',
                    'cec': 'cec',
                    'total_salt': 'total_salt',
                    'sar': 'sar',
                    'esp': 'esp',
                    'organic_carbon_C': 'organic_carbon_C',
                    'soil_moisture': 'soil_moisture',
                    'bulk_density': 'bulk_density',
                };

                let filledCount = 0;
                Object.keys(extracted).forEach(key => {
                    if (key === '_metadata') return;
                    const formField = fieldMapping[key];
                    if (formField && extracted[key] !== null && extracted[key] !== undefined && extracted[key] !== '') {
                        let value = extracted[key];

                        // Tarih formatını düzelt (YYYY-MM-DD -> input formatına)
                        if (key.includes('date') && typeof value === 'string') {
                            const dateStr = value.split('T')[0]; // YYYY-MM-DD formatı
                            if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                updatedFormData[formField] = dateStr;
                                filledCount++;
                            }
                        } else if (typeof value === 'number') {
                            // Sayısal değerleri string'e çevir, gereksiz sıfırları temizle
                            if (Number.isInteger(value)) {
                                updatedFormData[formField] = String(value);
                            } else {
                                // Ondalıklı sayılar için gereksiz sıfırları kaldır
                                updatedFormData[formField] = String(parseFloat(value.toFixed(10)).toString());
                            }
                            filledCount++;
                        } else if (typeof value === 'string' && value.trim() !== '') {
                            // String değerleri temizle ve normalize et
                            const cleaned = value.trim();

                            // Eğer sayısal bir alan ise ve string içinde sayı varsa
                            const numericFields = ['pH', 'organic_matter', 'ec', 'lime_caCO3', 'sample_depth',
                                'phosphorus_P', 'potassium_K', 'nitrogen_N', 'calcium_Ca', 'magnesium_Mg',
                                'sulfur_S', 'iron_Fe', 'zinc_Zn', 'manganese_Mn', 'copper_Cu', 'boron_B',
                                'cec', 'total_salt', 'sar', 'esp', 'organic_carbon_C', 'soil_moisture', 'bulk_density'];

                            if (numericFields.includes(key)) {
                                // String'den sayı çıkar
                                const numMatch = cleaned.match(/[\d.,]+/);
                                if (numMatch) {
                                    const numStr = numMatch[0].replace(',', '.');
                                    const num = parseFloat(numStr);
                                    if (!isNaN(num)) {
                                        updatedFormData[formField] = String(num);
                                        filledCount++;
                                    }
                                }
                            } else {
                                // Normal string değer
                                updatedFormData[formField] = cleaned;
                                filledCount++;
                            }
                        }
                    }
                });

                setFormData(updatedFormData);
                setFileUploadError(null);
                setShowDataPopup(true); // Başarılı popup göster
            } else {
                // Başarısız durum - hata popup göster
                setExtractedData({
                    _error: true,
                    _metadata: {
                        error: result.error || 'Bilinmeyen hata',
                        message: result.message || 'Dosya işlenemedi',
                        extraction_method: result.extraction_method || 'Bilinmiyor',
                        file_name: file.name
                    }
                });
                setShowDataPopup(true);
                setFileUploadError(result.message || result.error || 'Dosya işlenemedi');
            }
        } catch (err) {
            // Network veya diğer hatalar
            setExtractedData({
                _error: true,
                _metadata: {
                    error: 'Bağlantı hatası',
                    message: err.message || 'Dosya yüklenirken bir hata oluştu',
                    file_name: file.name
                }
            });
            setShowDataPopup(true);
            setFileUploadError(err.message || 'Dosya yüklenirken bir hata oluştu');
        } finally {
            setFileUploading(false);
            // Input'u temizle
            e.target.value = '';
        }
    };

    const sections = [
        {
            title: 'Temel Bilgiler',
            required: false,
            icon: (
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            fields: [
                { name: 'sample_code', label: 'Numune No / Numune Kodu', type: 'text', placeholder: 'Örn: NUM-2024-001' },
                { name: 'sample_date', label: 'Numune Alım Tarihi', type: 'date' },
                { name: 'analysis_date', label: 'Analiz Tarihi', type: 'date' },
                { name: 'province', label: 'İl', type: 'text', placeholder: 'Örn: Konya' },
                { name: 'district', label: 'İlçe / Saha-Parsel', type: 'text', placeholder: 'Opsiyonel' },
                { name: 'sample_depth', label: 'Numune Derinliği (cm)', type: 'number', placeholder: 'Örn: 30' },
                { name: 'laboratory_name', label: 'Laboratuvar Adı', type: 'text', placeholder: 'Laboratuvar adı' },
                { name: 'pH', label: 'pH', type: 'number', placeholder: 'Örn: 6.7' },
                { name: 'organic_matter', label: 'Organik Madde (%)', type: 'number', placeholder: 'Örn: 2.3' },
                { name: 'phosphorus_P', label: 'Fosfor (P) - Alınabilir P (mg/kg)', type: 'number', placeholder: 'Örn: 45' },
                { name: 'potassium_K', label: 'Potasyum (K) - Değişebilir K (mg/kg)', type: 'number', placeholder: 'Örn: 35' },
            ],
        },
        {
            title: 'Genellikle Bulunan Bilgiler',
            required: false,
            icon: (
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            fields: [
                { name: 'ec', label: 'EC (Elektriksel İletkenlik / Tuzluluk) (dS/m)', type: 'number', placeholder: 'Örn: 1.2' },
                { name: 'lime_caCO3', label: 'Kireç (CaCO₃, %)', type: 'number', placeholder: 'Örn: 5.5' },
                { name: 'soil_texture', label: 'Toprak Bünyesi / Tekstür', type: 'select', options: ['', 'kumlu', 'tınlı', 'killi'] },
                { name: 'nitrogen_N', label: 'Azot (N) - Toplam veya Alınabilir (mg/kg)', type: 'number', placeholder: 'Örn: 50' },
                { name: 'evaluation_level', label: 'Değerlendirme Seviyesi', type: 'select', options: ['', 'düşük', 'orta', 'yüksek'] },
                { name: 'fertilization_recommendation', label: 'Gübreleme Önerisi (N-P-K)', type: 'text', placeholder: 'Örn: 20-10-10' },
            ],
        },
        {
            title: 'Opsiyonel - İleri Analiz',
            required: false,
            icon: (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            fields: [
                { name: 'calcium_Ca', label: 'Kalsiyum (Ca) (mg/kg)', type: 'number', placeholder: 'Örn: 120' },
                { name: 'magnesium_Mg', label: 'Magnezyum (Mg) (mg/kg)', type: 'number', placeholder: 'Örn: 45' },
                { name: 'sulfur_S', label: 'Kükürt (S) (mg/kg)', type: 'number', placeholder: 'Örn: 15' },
                { name: 'iron_Fe', label: 'Demir (Fe) (mg/kg)', type: 'number', placeholder: 'Örn: 8.5' },
                { name: 'zinc_Zn', label: 'Çinko (Zn) (mg/kg)', type: 'number', placeholder: 'Örn: 2.3' },
                { name: 'manganese_Mn', label: 'Mangan (Mn) (mg/kg)', type: 'number', placeholder: 'Örn: 12.5' },
                { name: 'copper_Cu', label: 'Bakır (Cu) (mg/kg)', type: 'number', placeholder: 'Örn: 1.8' },
                { name: 'boron_B', label: 'Bor (B) (mg/kg veya ppm)', type: 'number', placeholder: 'Örn: 0.5' },
                { name: 'cec', label: 'CEC (Katyon Değişim Kapasitesi) (meq/100g)', type: 'number', placeholder: 'Örn: 25.5' },
                { name: 'total_salt', label: 'Toplam Tuz (%)', type: 'number', placeholder: 'Örn: 0.8' },
                { name: 'sar', label: 'SAR (Sodium Adsorption Ratio)', type: 'number', placeholder: 'Örn: 2.5' },
                { name: 'esp', label: 'ESP (Exchangeable Sodium %)', type: 'number', placeholder: 'Örn: 5.2' },
                { name: 'organic_carbon_C', label: 'Organik Karbon (C) (%)', type: 'number', placeholder: 'Örn: 1.2' },
                { name: 'soil_moisture', label: 'Toprak Nemi (%)', type: 'number', placeholder: 'Örn: 15.5' },
                { name: 'bulk_density', label: 'Bulk Density (Hacim Ağırlığı) (g/cm³)', type: 'number', placeholder: 'Örn: 1.35' },
            ],
        },
        {
            title: 'İklim Bilgileri',
            required: false,
            icon: (
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
            ),
            fields: [
                { name: 'avg_temp_c', label: 'Ortalama Sıcaklık (°C)', type: 'number', placeholder: 'Örn: 22.5' },
                { name: 'min_temp_c', label: 'Minimum Sıcaklık (°C)', type: 'number', placeholder: 'Örn: 15' },
                { name: 'max_temp_c', label: 'Maksimum Sıcaklık (°C)', type: 'number', placeholder: 'Örn: 30' },
                { name: 'rainfall_mm', label: 'Yağış (mm)', type: 'number', placeholder: 'Örn: 120' },
                { name: 'humidity_pct', label: 'Nem (%)', type: 'number', placeholder: 'Örn: 55' },
                { name: 'drought_index', label: 'Kuraklık İndeksi', type: 'number', placeholder: 'Örn: 2.5' },
            ],
        },
        {
            title: 'Konum ve Zaman',
            required: false,
            icon: (
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            fields: [
                { name: 'country', label: 'Ülke', type: 'text', placeholder: 'Türkiye' },
                { name: 'lat', label: 'Enlem', type: 'number', placeholder: 'Örn: 37.8746' },
                { name: 'lon', label: 'Boylam', type: 'number', placeholder: 'Örn: 32.4932' },
                { name: 'season', label: 'Mevsim', type: 'select', options: ['ilkbahar', 'yaz', 'sonbahar', 'kış'] },
                { name: 'month', label: 'Ay (1-12)', type: 'number', placeholder: 'Örn: 4' },
            ],
        },
        {
            title: 'Kısıtlar ve Hedefler',
            required: false,
            icon: (
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            fields: [
                { name: 'irrigation', label: 'Sulama Durumu', type: 'select', options: ['yok', 'az', 'orta', 'iyi'] },
                { name: 'previous_crop', label: 'Önceki Ürün', type: 'text', placeholder: 'Örn: buğday' },
                { name: 'goal', label: 'Hedef', type: 'text', placeholder: 'Örn: düşük su + düşük risk' },
            ],
        },
    ];

    return (
        <div className="relative">
            {/* Çıkarılan Veri / Hata Popup */}
            {showDataPopup && extractedData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        <div className={`flex items-center justify-between p-4 border-b ${extractedData._error ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                            }`}>
                            <div className="flex items-center gap-3">
                                {extractedData._error ? (
                                    <>
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <h3 className="text-lg font-bold text-red-900">Dosya İşleme Hatası</h3>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <h3 className="text-lg font-bold text-green-900">Başarıyla İşlendi</h3>
                                            {extractedData._metadata && (
                                                <p className="text-xs text-green-700 mt-0.5">
                                                    {extractedData._metadata.matched_fields_count || 0} alan eşleştirildi
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={() => setShowDataPopup(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="overflow-y-auto p-4 flex-1">
                            {extractedData._error ? (
                                // Hata durumu
                                <div className="space-y-3">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm font-semibold text-red-900 mb-2">
                                            {extractedData._metadata?.error || 'Hata'}
                                        </p>
                                        <p className="text-sm text-red-700">
                                            {extractedData._metadata?.message || 'Bilinmeyen bir hata oluştu'}
                                        </p>
                                    </div>
                                    {extractedData._metadata?.extraction_method && (
                                        <div className="text-xs text-gray-600">
                                            <span className="font-semibold">Kullanılan yöntem:</span> {extractedData._metadata.extraction_method}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Başarılı durum - eşleşen veriler
                                <div className="space-y-4">
                                    {extractedData._metadata && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="font-semibold text-blue-900">Dosya:</span>
                                                    <span className="text-blue-700 ml-2">{extractedData._metadata.file_name}</span>
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-blue-900">Yöntem:</span>
                                                    <span className="text-blue-700 ml-2">{extractedData._metadata.extraction_method}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="font-semibold text-blue-900">Eşleşen Alanlar:</span>
                                                    <span className="text-blue-700 ml-2">
                                                        {extractedData._metadata.matched_fields_count || 0} alan bulundu
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Eşleşen Veriler:</h4>
                                        <div className="space-y-2">
                                            {Object.keys(extractedData)
                                                .filter(key => key !== '_metadata' && extractedData[key] !== null && extractedData[key] !== undefined && extractedData[key] !== '')
                                                .map(key => (
                                                    <div key={key} className="flex items-start gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                                                        <span className="text-xs font-semibold text-gray-600 min-w-[140px]">{key}:</span>
                                                        <span className="text-sm text-gray-900 flex-1 break-words">{String(extractedData[key])}</span>
                                                    </div>
                                                ))}
                                            {Object.keys(extractedData).filter(key => key !== '_metadata' && extractedData[key] !== null && extractedData[key] !== undefined && extractedData[key] !== '').length === 0 && (
                                                <p className="text-sm text-gray-500 text-center py-4">Hiçbir veri eşleştirilemedi</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-2">
                            <button
                                onClick={() => setShowDataPopup(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="card space-y-6">
                {/* Mod Seçimi */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Veri Giriş Modu Seçin
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setInputMode('manual')}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${inputMode === 'manual'
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${inputMode === 'manual' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                                    }`}>
                                    {inputMode === 'manual' && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <span className={`font-semibold ${inputMode === 'manual' ? 'text-indigo-900' : 'text-gray-700'}`}>
                                    Manuel Veri Girişi
                                </span>
                            </div>
                            <p className="text-xs text-gray-600">
                                Form alanlarını manuel olarak doldurun veya dosya yükleyin
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setInputMode('location-only')}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${inputMode === 'location-only'
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${inputMode === 'location-only' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                                    }`}>
                                    {inputMode === 'location-only' && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <span className={`font-semibold ${inputMode === 'location-only' ? 'text-indigo-900' : 'text-gray-700'}`}>
                                    Sadece Konum
                                </span>
                            </div>
                            <p className="text-xs text-gray-600">
                                Haritadan konum seçin, tarih ve mevsim otomatik belirlenir
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setInputMode('mixed')}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${inputMode === 'mixed'
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${inputMode === 'mixed' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                                    }`}>
                                    {inputMode === 'mixed' && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <span className={`font-semibold ${inputMode === 'mixed' ? 'text-indigo-900' : 'text-gray-700'}`}>
                                    Karışık Mod
                                </span>
                            </div>
                            <p className="text-xs text-gray-600">
                                Hem konum hem manuel veri girişi yapabilirsiniz
                            </p>
                        </button>
                    </div>
                </div>

                {/* Harita Bölümü - Sadece Konum veya Karışık Mod */}
                {(inputMode === 'location-only' || inputMode === 'mixed') && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Konum Seçimi
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                            Haritaya tıklayarak konum seçin. Enlem ve boylam otomatik olarak doldurulacak.
                        </p>
                        <LocationMap
                            onLocationSelect={handleLocationSelect}
                            initialLat={formData.lat}
                            initialLon={formData.lon}
                        />
                        {(formData.lat && formData.lon) && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 text-sm">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-green-800 font-medium">Konum seçildi:</span>
                                    <span className="text-green-700">Enlem: {parseFloat(formData.lat).toFixed(6)}, Boylam: {parseFloat(formData.lon).toFixed(6)}</span>
                                </div>
                                {(inputMode === 'location-only' || inputMode === 'mixed') && (
                                    <div className="mt-2 text-xs text-green-700">
                                        <p>• Tarih: {formData.sample_date || getCurrentDate()}</p>
                                        <p>• Mevsim: {formData.season || getSeasonFromMonth(getCurrentMonth())}</p>
                                        <p>• Ay: {formData.month || getCurrentMonth()}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Dosya Yükleme Bölümü - Manuel ve Karışık Mod */}
                {(inputMode === 'manual' || inputMode === 'mixed') && (
                    <div>
                        {!uploadedFile && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <h3 className="text-sm font-semibold text-gray-900">Dosyadan Otomatik Doldur</h3>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 mb-3">
                                    Toprak analiz raporunuzu yükleyin (PDF, Word, CSV, Excel veya resim). Form otomatik doldurulacak.
                                </p>
                                <div className="flex items-center gap-3">
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="file"
                                            onChange={handleFileUpload}
                                            disabled={fileUploading || loading}
                                            accept=".pdf,.doc,.docx,.csv,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                                            className="hidden"
                                        />
                                        <div className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed transition-all ${fileUploading || loading
                                            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                            : 'border-blue-300 bg-white hover:border-blue-500 hover:bg-blue-50'
                                            }`}>
                                            {fileUploading ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span className="text-sm font-medium text-gray-700">İşleniyor...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    <span className="text-sm font-medium text-gray-700">Dosya Seç</span>
                                                </>
                                            )}
                                        </div>
                                    </label>
                                </div>
                                {fileUploadError && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                        {fileUploadError}
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    Desteklenen formatlar: PDF, Word (.doc, .docx), CSV, Excel (.xlsx, .xls), Resim (.jpg, .png, vb.)
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Form Alanları - Manuel ve Karışık Mod */}
                {(inputMode === 'manual' || inputMode === 'mixed') && (
                    <>
                        {sections.map((section, idx) => (
                            <div key={idx} className={idx > 0 ? 'border-t border-gray-200 pt-6' : ''}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="section-title flex items-center gap-2.5 mb-0 pb-0 border-0">
                                        {section.icon}
                                        <span>{section.title}</span>
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {section.fields.map(field => (
                                        <div key={field.name} className={field.name === 'fertilization_recommendation' || field.name === 'goal' ? 'md:col-span-2' : ''}>
                                            <label htmlFor={field.name} className="form-label">
                                                <span className="flex items-center gap-1.5">
                                                    {field.label}
                                                </span>
                                                {!field.required && (
                                                    <span className="optional block mt-0.5">(opsiyonel)</span>
                                                )}
                                            </label>
                                            {field.type === 'select' ? (
                                                <select
                                                    id={field.name}
                                                    name={field.name}
                                                    value={formData[field.name]}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    disabled={loading}
                                                    required={field.required}
                                                    className={`form-input ${errors[field.name] && touched[field.name]
                                                        ? 'border-red-500 ring-2 ring-red-200'
                                                        : ''
                                                        }`}
                                                >
                                                    {field.options.map(opt => (
                                                        <option key={opt} value={opt}>{opt || 'Seçiniz'}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    id={field.name}
                                                    name={field.name}
                                                    type={field.type}
                                                    value={formData[field.name]}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    placeholder={field.placeholder}
                                                    disabled={loading}
                                                    required={field.required}
                                                    className={`form-input ${errors[field.name] && touched[field.name]
                                                        ? 'border-red-500 ring-2 ring-red-200'
                                                        : field.required
                                                            ? 'border-blue-300'
                                                            : ''
                                                        }`}
                                                    onKeyDown={(e) => {
                                                        // Sayısal alanlarda sadece sayı, nokta, eksi, backspace, delete, arrow keys kabul et
                                                        if (field.type === 'number') {
                                                            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter'];
                                                            const isNumber = /[0-9]/.test(e.key);
                                                            const isDot = e.key === '.' && !e.target.value.includes('.');
                                                            const isMinus = e.key === '-' && e.target.selectionStart === 0 && !e.target.value.includes('-');
                                                            const isAllowed = allowedKeys.includes(e.key) || isNumber || isDot || isMinus;
                                                            if (!isAllowed) {
                                                                e.preventDefault();
                                                            }
                                                        }
                                                    }}
                                                />
                                            )}
                                            {errors[field.name] && touched[field.name] && (
                                                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                                                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{errors[field.name]}</span>
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* Sadece Konum Modu - Özet Bilgi */}
                {inputMode === 'location-only' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Konum Bilgileri</h3>
                        {formData.lat && formData.lon ? (
                            <div className="space-y-2 text-sm">
                                <p><span className="font-medium">Enlem:</span> {parseFloat(formData.lat).toFixed(6)}</p>
                                <p><span className="font-medium">Boylam:</span> {parseFloat(formData.lon).toFixed(6)}</p>
                                <p><span className="font-medium">Tarih:</span> {formData.sample_date || getCurrentDate()}</p>
                                <p><span className="font-medium">Mevsim:</span> {formData.season || getSeasonFromMonth(getCurrentMonth())}</p>
                                <p><span className="font-medium">Ay:</span> {formData.month || getCurrentMonth()}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">Lütfen haritadan bir konum seçin.</p>
                        )}
                    </div>
                )}

                <div className="pt-6 mt-6 border-t-2 border-gray-300 bg-gray-50/50 -mx-6 -mb-6 px-6 py-6 rounded-b-xl">
                    <button
                        type="submit"
                        disabled={loading || Object.keys(errors).some(key => errors[key])}
                        className="btn-primary max-w-md mx-auto"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analiz ediliyor...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Analiz Başlat
                            </span>
                        )}
                    </button>

                    {Object.keys(errors).some(key => errors[key]) && (
                        <p className="text-red-600 text-xs mt-3 text-center flex items-center justify-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Lütfen formdaki hataları düzeltin
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CropForm;
