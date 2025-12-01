import React from 'react';
import { BookOpen, Camera, Palette, GraduationCap, Wand2 } from 'lucide-react';
import { StudyMode } from '../types';

interface SidebarProps {
  currentMode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange }) => {
  const navItems = [
    { id: 'chat' as StudyMode, label: 'Tutor Inteligente', icon: BookOpen, desc: 'Tire dúvidas e pesquise' },
    { id: 'homework' as StudyMode, label: 'Ajuda com Dever', icon: Camera, desc: 'Analise fotos de tarefas' },
    { id: 'creative' as StudyMode, label: 'Laboratório Criativo', icon: Palette, desc: 'Gere imagens para projetos' },
    { id: 'editor' as StudyMode, label: 'Editor Mágico', icon: Wand2, desc: 'Edite suas fotos' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col shrink-0 hidden md:flex">
      <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
            <h1 className="font-bold text-gray-800 text-lg">SAES</h1>
            <p className="text-xs text-gray-500">Estude da melhor forma.</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onModeChange(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 text-left group ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={`p-2 rounded-lg mr-3 ${isActive ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              </div>
              <div>
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-gray-400 font-light">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
          <h3 className="text-sm font-semibold mb-1">Dica de Estudo</h3>
          <p className="text-xs opacity-90">Mantenha a constância! Use o Tutor Inteligente para revisar o conteúdo diariamente.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;