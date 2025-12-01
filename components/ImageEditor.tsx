import React, { useState, useRef } from 'react';
import { Upload, X, RefreshCw, Wand2, Download, Image as ImageIcon, ArrowRight, AlertCircle } from 'lucide-react';
import { editStudyImage } from '../services/geminiService';

const ImageEditor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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
        setMimeType(file.type);
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);

    try {
      const response = await editStudyImage(selectedImage, mimeType, prompt);
      
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
         // Sometimes it might return text if it refuses or explains something
         const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
         if (textPart) {
             setError(`A IA respondeu com texto: ${textPart.text}`);
         } else {
             setError("Nenhuma imagem gerada. Tente uma instrução diferente.");
         }
      }

    } catch (e: any) {
      console.error(e);
      setError("Erro ao editar imagem. Verifique sua conexão ou tente outra imagem.");
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAll = () => {
    setSelectedImage(null);
    setGeneratedImage(null);
    setPrompt('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <header className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Wand2 className="w-6 h-6 text-purple-600" />
            Editor Mágico
          </h2>
          <p className="text-gray-600">Carregue uma imagem e peça para a IA fazer alterações.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-gray-500" />
                Imagem Original
              </h3>
              
              {!selectedImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all group h-64"
                >
                  <div className="bg-purple-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-gray-900 font-medium">Carregar imagem</p>
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
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-square flex items-center justify-center group">
                    <img 
                      src={`data:${mimeType};base64,${selectedImage}`} 
                      alt="Original" 
                      className="max-h-full max-w-full object-contain"
                    />
                    <button 
                      onClick={clearAll}
                      className="absolute top-3 right-3 bg-white/90 p-2 rounded-full hover:bg-white text-gray-800 transition-all shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
               <label className="block text-sm font-medium text-gray-700 mb-2">Instrução de Edição</label>
               <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Adicione um filtro vintage, remova o fundo, coloque um chapéu no gato..."
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none h-24"
                  disabled={!selectedImage}
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedImage || !prompt.trim()}
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Gerar Edição
                    </>
                  )}
                </button>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-4">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-full min-h-[500px] flex flex-col">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-600" />
                  Resultado
                </h3>
                
                <div className="flex-1 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center relative overflow-hidden">
                    {isGenerating ? (
                        <div className="text-center space-y-3 p-8">
                            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                            <p className="text-gray-500 font-medium animate-pulse">A mágica está acontecendo...</p>
                        </div>
                    ) : generatedImage ? (
                        <div className="relative group w-full h-full flex items-center justify-center bg-gray-900">
                             <img 
                                src={generatedImage} 
                                alt="Edited" 
                                className="max-w-full max-h-full object-contain"
                            />
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a 
                                    href={generatedImage} 
                                    download={`sesi-edit-${Date.now()}.png`}
                                    className="bg-white text-gray-900 px-6 py-2.5 rounded-full shadow-lg flex items-center gap-2 font-medium hover:bg-gray-100 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Baixar Imagem
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 p-8">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ArrowRight className="w-8 h-8 text-gray-300" />
                            </div>
                            <p>Sua imagem editada aparecerá aqui</p>
                        </div>
                    )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;