import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, Bot, User, RefreshCw, AlertCircle } from 'lucide-react';
import { Message } from '../types';
import { createChatSession, sendMessageToChat } from '../services/geminiService';
import { Chat } from '@google/genai';
import ReactMarkdown from 'react-markdown';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Olá! Eu sou seu assistente de estudos do SAES! Como posso te ajudar hoje? Posso responder perguntas complexas ou buscar informações atualizadas na web.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Re-create chat session when toggle changes
  useEffect(() => {
    const initChat = async () => {
      try {
        const chat = createChatSession(useSearch);
        setChatSession(chat);
      } catch (e) {
        console.error("Failed to init chat", e);
      }
    };
    initChat();
  }, [useSearch]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await sendMessageToChat(chatSession, userMsg.content);
      const text = result.text;
      
      // Extract grounding metadata if present
      const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const groundingData = chunks ? { groundingChunks: chunks } : undefined;

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: text || "Desculpe, não consegui gerar uma resposta.",
        timestamp: new Date(),
        groundingMetadata: groundingData as any
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "Ocorreu um erro ao processar sua mensagem. Tente novamente.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          Tutor Inteligente
        </h2>
        <button
          onClick={() => setUseSearch(!useSearch)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            useSearch 
              ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-1' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          {useSearch ? 'Pesquisa Web Ativa' : 'Pesquisa Web Inativa'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : msg.isError 
                    ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
              }`}
            >
              <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
                {msg.role === 'user' ? (
                  <>
                    <span>Você</span>
                    <User className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3" />
                    <span>Tutor SESI</span>
                  </>
                )}
              </div>
              
              <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                 <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>

              {msg.groundingMetadata?.groundingChunks && (
                <div className="mt-3 pt-3 border-t border-gray-100/20 text-xs">
                  <p className="font-semibold mb-1 flex items-center gap-1 opacity-80">
                    <Globe className="w-3 h-3" /> Fontes:
                  </p>
                  <ul className="space-y-1">
                    {msg.groundingMetadata.groundingChunks.map((chunk, idx) => 
                      chunk.web ? (
                        <li key={idx}>
                          <a 
                            href={chunk.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline opacity-80 hover:opacity-100 truncate block"
                          >
                            {chunk.web.title || chunk.web.uri}
                          </a>
                        </li>
                      ) : null
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-500">Pensando...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Digite sua pergunta..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors flex items-center justify-center min-w-[3rem]"
          >
            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
