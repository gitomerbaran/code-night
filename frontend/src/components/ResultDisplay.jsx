const ResultDisplay = ({ result, loading, error }) => {
  const getContent = () => {
    if (loading && !result) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="relative">
              <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mt-4">Analiz ediliyor...</p>
            <p className="text-xs text-gray-500 mt-1">Lütfen bekleyin</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="border-l-4 border-red-500 bg-red-50 rounded-lg p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold text-sm mb-1">Hata</h3>
              <p className="text-red-700 text-sm">{error.message || 'Bir hata oluştu'}</p>
              {error.details && (
                <a href={error.details} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800 text-xs mt-2 inline-flex items-center gap-1">
                  Daha fazla bilgi
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (!result) {
      return (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 font-medium">Formu doldurup analiz başlatın</p>
            <p className="text-xs text-gray-500 mt-1">Tüm alanlar opsiyoneldir</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Primary Crop - Premium Card */}
        {result.primary_crop && (
          <div className="premium-card border-2 border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Önerilen Ürün
              </h3>
              {result.confidence && (
                <span className="badge badge-primary font-semibold">{result.confidence}% Güven</span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-4">{result.primary_crop}</p>
            {result.confidence && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Güven Oranı</span>
                  <span className="font-semibold">{result.confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${result.confidence}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Alternatives */}
        {result.alternatives && result.alternatives.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Alternatif Ürünler
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.alternatives.map((alt, idx) => (
                <span 
                  key={idx}
                  className="badge badge-info"
                >
                  {alt}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reasons */}
        {result.reasons && result.reasons.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Öneri Gerekçeleri
            </h3>
            <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
              <ul className="space-y-2.5">
                {result.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Risks */}
        {result.risks && result.risks.length > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Dikkat Edilmesi Gerekenler
            </h3>
            <ul className="space-y-2">
              {result.risks.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-amber-900">
                  <span className="text-amber-600 mt-0.5 font-bold">•</span>
                  <span className="leading-relaxed">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Actions */}
        {result.quick_actions && result.quick_actions.length > 0 && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-lg p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Önerilen Aksiyonlar
            </h3>
            <ul className="space-y-2">
              {result.quick_actions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-emerald-900">
                  <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing Inputs */}
        {result.missing_inputs && result.missing_inputs.length > 0 && result.missing_inputs.length < 10 && (
          <div className="bg-slate-50 border-l-4 border-slate-400 rounded-lg p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Eksik Bilgiler
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Daha doğru öneri için şu bilgileri ekleyebilirsiniz: <span className="font-medium">{result.missing_inputs.slice(0, 5).join(', ')}</span>
              {result.missing_inputs.length > 5 && '...'}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-900">
          Analiz Sonuçları
        </h2>
        {result && (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div className="max-h-[calc(100vh-16rem)] overflow-y-auto pr-2 -mr-2">
        {getContent()}
      </div>
    </div>
  );
};

export default ResultDisplay;
