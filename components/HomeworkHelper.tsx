import React, { useState, useRef } from 'react';
import { Upload, X, RefreshCw, Camera, CheckCircle, AlertTriangle } from 'lucide-react';
import { analyzeHomeworkImage } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const HomeworkHelper: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("A imagem deve ter no máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Strip prefix for API
        const base64Data = base64String.split(',')[1];
        setSelectedImage(base64Data);
        // Also store preview url if needed, but we can use base64String for img src
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await analyzeHomeworkImage(selectedImage, prompt);
      setResult(response.text || "Não foi possível analisar a imagem.");
    } catch (e: any) {
      setError("Erro ao analisar a imagem. Tente novamente.");
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setResult(null);
    setPrompt('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <header className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ajuda com Dever de Casa</h2>
          <p className="text-gray-600">Tire uma foto do seu exercício e deixe a IA te ajudar a entender a solução.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            {!selectedImage ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group h-64"
              >
                <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-900 font-medium">Clique para enviar uma foto</p>
                <p className="text-sm text-gray-500 mt-1">JPG ou PNG até 5MB</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center group">
                  <img 
                    src={`data:image/jpeg;base64,${selectedImage}`} 
                    alt="Homework" 
                    className="max-h-full max-w-full object-contain"
                  />
                  <button 
                    onClick={clearImage}
                    className="absolute top-3 right-3 bg-white/90 p-2 rounded-full hover:bg-white text-gray-800 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">O que você quer saber sobre esta imagem?</label>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Como resolvo essa equação? ou Explique este diagrama."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Analisar Tarefa
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-8 bg-green-500 rounded-full"></div>
              Explicação do Tutor
            </h3>
            <div className="prose prose-blue max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeworkHelper;
