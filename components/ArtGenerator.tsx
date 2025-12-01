import React, { useState } from 'react';
import { Palette, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { generateStudyImage } from '../services/geminiService';
import { ImageGenConfig } from '../types';

const ArtGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [config, setConfig] = useState<ImageGenConfig>({
    aspectRatio: '1:1'
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);

    try {
      const response = await generateStudyImage(prompt, config);
      
      // Extract image from response parts
      let imageUrl = null;
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (imageUrl) {
        setGeneratedImage(imageUrl);
      } else {
        throw new Error("Nenhuma imagem gerada encontrada na resposta.");
      }

    } catch (e: any) {
      console.error(e);
      setError("Erro ao gerar imagem. Tente descrever de outra forma ou verifique sua conexão.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <header className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Laboratório Criativo</h2>
          <p className="text-gray-600">Crie ilustrações rápidas para seus projetos escolares usando IA.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls */}
            <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-700 mb-4">Configurações</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">Formato</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['1:1', '16:9', '4:3'] as const).map((ratio) => (
                                    <button
                                        key={ratio}
                                        onClick={() => setConfig({...config, aspectRatio: ratio})}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                                            config.aspectRatio === ratio
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Prompt and Preview */}
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Descreva a imagem que você quer criar... Ex: Um robô futurista estudando em uma biblioteca flutuante no espaço, estilo cyberpunk."
                        className="w-full p-4 rounded-lg resize-none focus:outline-none focus:bg-gray-50 transition-colors h-32"
                    />
                    <div className="flex justify-between items-center px-2 pb-2">
                        <span className="text-xs text-gray-400">Quanto mais detalhes, melhor o resultado.</span>
                        <button
                            onClick={generate}
                            disabled={isGenerating || !prompt.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
                            Gerar Arte
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px] flex items-center justify-center p-4 relative">
                    {isGenerating ? (
                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                            <p className="text-gray-500 font-medium animate-pulse">Criando sua obra de arte...</p>
                            <p className="text-xs text-gray-400">Isso pode levar alguns segundos.</p>
                        </div>
                    ) : generatedImage ? (
                        <div className="relative group w-full h-full flex items-center justify-center">
                            <img 
                                src={generatedImage} 
                                alt="Generated Art" 
                                className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg"
                            />
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a 
                                    href={generatedImage} 
                                    download={`sesi-art-${Date.now()}.png`}
                                    className="bg-white/90 text-gray-800 p-3 rounded-full hover:bg-white shadow-lg flex items-center gap-2 font-medium"
                                >
                                    <Download className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 space-y-2">
                            <Palette className="w-12 h-12 mx-auto opacity-20" />
                            <p>Sua imagem aparecerá aqui</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ArtGenerator;