import { useEffect, useRef, useState } from 'react';

const LocationMap = ({ onLocationSelect, initialLat, initialLon }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);

    useEffect(() => {
        // Leaflet CSS ve JS'yi dinamik yükle
        const loadLeaflet = () => {
            if (window.L) {
                setIsLoaded(true);
                initMap();
                return;
            }

            // CSS yükle
            if (!document.querySelector('link[href*="leaflet.css"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            // JS yükle
            if (!document.querySelector('script[src*="leaflet.js"]')) {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = () => {
                    // Leaflet marker icon fix
                    delete window.L.Icon.Default.prototype._getIconUrl;
                    window.L.Icon.Default.mergeOptions({
                        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    });
                    setIsLoaded(true);
                    initMap();
                };
                script.onerror = () => {
                    console.error('Leaflet yüklenemedi');
                };
                document.head.appendChild(script);
            } else {
                // Script zaten yüklenmiş, sadece bekle
                const checkInterval = setInterval(() => {
                    if (window.L) {
                        clearInterval(checkInterval);
                        delete window.L.Icon.Default.prototype._getIconUrl;
                        window.L.Icon.Default.mergeOptions({
                            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                        });
                        setIsLoaded(true);
                        initMap();
                    }
                }, 100);
            }
        };

        loadLeaflet();

        return () => {
            // Cleanup
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            if (markerRef.current) {
                markerRef.current = null;
            }
        };
    }, []);

    const initMap = () => {
        if (!window.L || !mapRef.current) return;
        
        // Harita zaten başlatılmışsa tekrar başlatma
        if (mapInstanceRef.current) {
            return;
        }

        try {
            const defaultCenter = initialLat && initialLon
                ? [parseFloat(initialLat), parseFloat(initialLon)]
                : [39.9, 32.8]; // Türkiye merkezi

            // Haritayı oluştur
            const map = window.L.map(mapRef.current).setView(defaultCenter, initialLat && initialLon ? 10 : 6);

            // Tile layer ekle
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            mapInstanceRef.current = map;

            // Başlangıç marker'ı
            if (initialLat && initialLon) {
                const position = [parseFloat(initialLat), parseFloat(initialLon)];
                markerRef.current = window.L.marker(position).addTo(map);
            }

            // Haritaya tıklama eventi
            map.on('click', (e) => {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;

                // Eski marker'ı kaldır
                if (markerRef.current) {
                    map.removeLayer(markerRef.current);
                }

                // Yeni marker ekle
                markerRef.current = window.L.marker([lat, lng]).addTo(map);
                setCurrentLocation({ lat, lng });

                // Callback çağır
                onLocationSelect(lat, lng);
            });
        } catch (err) {
            console.error('Harita oluşturma hatası:', err);
        }
    };

    // initialLat veya initialLon değiştiğinde haritayı güncelle
    useEffect(() => {
        if (mapInstanceRef.current && isLoaded && window.L) {
            if (initialLat && initialLon) {
                const newPosition = [parseFloat(initialLat), parseFloat(initialLon)];
                mapInstanceRef.current.setView(newPosition, 10);

                if (markerRef.current) {
                    mapInstanceRef.current.removeLayer(markerRef.current);
                }

                markerRef.current = window.L.marker(newPosition).addTo(mapInstanceRef.current);
                setCurrentLocation({ lat: parseFloat(initialLat), lng: parseFloat(initialLon) });
            }
        }
    }, [initialLat, initialLon, isLoaded]);

    const handleGPSLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    if (mapInstanceRef.current && window.L) {
                        mapInstanceRef.current.setView([lat, lng], 12);

                        if (markerRef.current) {
                            mapInstanceRef.current.removeLayer(markerRef.current);
                        }

                        markerRef.current = window.L.marker([lat, lng]).addTo(mapInstanceRef.current);
                        setCurrentLocation({ lat, lng });
                        onLocationSelect(lat, lng);
                    }
                },
                (error) => {
                    console.error('Konum alınamadı:', error);
                    alert('Konum alınamadı. Lütfen tarayıcı ayarlarınızı kontrol edin.');
                }
            );
        } else {
            alert('Tarayıcınız konum servisini desteklemiyor.');
        }
    };

    return (
        <div className="w-full">
            <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg" style={{ height: '500px' }}>
                <div
                    ref={mapRef}
                    className="w-full h-full"
                    style={{ minHeight: '500px' }}
                />
                {!isLoaded && (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                            <svg className="animate-spin h-8 w-8 text-green-600 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-600 text-sm">Harita yükleniyor...</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-3">
                <button
                    onClick={handleGPSLocation}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Mevcut Konumumu Bul
                </button>

                {currentLocation && (
                    <p className="text-center text-gray-600 text-sm mt-2">
                        Koordinat: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LocationMap;
