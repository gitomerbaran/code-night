import { useState } from 'react';
import CropForm from './components/CropForm';
import ResultDisplay from './components/ResultDisplay';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let resultText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        resultText += chunk;

        try {
          let trimmed = resultText.trim();
          trimmed = trimmed.replace(/^```json\s*/i, '');
          trimmed = trimmed.replace(/^```\s*/g, '');
          trimmed = trimmed.replace(/\s*```$/g, '');
          trimmed = trimmed.trim();

          let parsed = null;
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            parsed = JSON.parse(trimmed);
          } else {
            const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                parsed = JSON.parse(jsonMatch[0]);
              } catch (e) {
                // Still parsing
              }
            }
          }

          if (parsed) {
            if (parsed.error) {
              setError(parsed);
              break;
            }
            setResult(parsed);
          }
        } catch (e) {
          // Still streaming
        }
      }

      if (!error) {
        try {
          let trimmed = resultText.trim();
          trimmed = trimmed.replace(/^```json\s*/i, '');
          trimmed = trimmed.replace(/^```\s*/g, '');
          trimmed = trimmed.replace(/\s*```$/g, '');
          trimmed = trimmed.trim();

          let finalResult;
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            finalResult = JSON.parse(trimmed);
          } else {
            const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              finalResult = JSON.parse(jsonMatch[0]);
            }
          }

          if (finalResult && !finalResult.error) {
            setResult(finalResult);
          }
        } catch (e) {
          // Already displayed
        }
      }
    } catch (err) {
      setError({ error: 'Hata', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Premium Header */}
      <header className="premium-header shadow-lg sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Tarım Pusulası
                </h1>
                <p className="text-blue-100 text-sm mt-0.5">
                  Toprak analiz raporu ile ürün önerisi
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid xl:grid-cols-[1.2fr_1fr] gap-8">
          {/* Form Section - Left Side */}
          <div className="min-w-0">
            <CropForm onSubmit={handleSubmit} loading={loading} />
          </div>

          {/* Results Section - Right Side, Sticky */}
          <div className="xl:sticky xl:top-24 xl:self-start">
            <ResultDisplay result={result} loading={loading} error={error} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
