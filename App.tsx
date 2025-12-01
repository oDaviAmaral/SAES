import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import HomeworkHelper from './components/HomeworkHelper';
import ArtGenerator from './components/ArtGenerator';
import ImageEditor from './components/ImageEditor';
import { StudyMode } from './types';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<StudyMode>('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (currentMode) {
      case 'chat':
        return <ChatInterface />;
      case 'homework':
        return <HomeworkHelper />;
      case 'creative':
        return <ArtGenerator />;
      case 'editor':
        return <ImageEditor />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 bg-white p-2 rounded-lg shadow-md border border-gray-200"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-800/50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="w-64 bg-white h-full shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
             <Sidebar 
                currentMode={currentMode} 
                onModeChange={(mode) => {
                    setCurrentMode(mode);
                    setIsMobileMenuOpen(false);
                }} 
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <Sidebar currentMode={currentMode} onModeChange={setCurrentMode} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative w-full">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;