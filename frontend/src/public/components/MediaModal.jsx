import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';

const MediaModal = ({ isOpen, onClose, images, videoUrl }) => {
  const allMedia = [];
  if (videoUrl) allMedia.push({ type: 'video', url: videoUrl });
  if (images) {
    images.forEach(img => allMedia.push({ type: 'image', url: img }));
  }

  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || allMedia.length === 0) return null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
  };

  const currentMedia = allMedia[currentIndex];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-[101]"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative w-full max-w-6xl h-full md:h-[85vh] flex items-center justify-center px-4">
        {allMedia.length > 1 && (
          <button 
            onClick={handlePrevious}
            className="absolute left-4 md:left-8 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-[101]"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="w-full h-full flex items-center justify-center p-4 md:p-12">
          {currentMedia.type === 'video' ? (
            <video 
              src={currentMedia.url} 
              controls 
              autoPlay
              muted
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />
          ) : (
            <img 
              src={currentMedia.url} 
              alt={`Media ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none"
            />
          )}
        </div>

        {allMedia.length > 1 && (
          <button 
            onClick={handleNext}
            className="absolute right-4 md:right-8 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-[101]"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {allMedia.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto pb-4 scrollbar-hide">
          {allMedia.map((media, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-16 h-12 md:w-20 md:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex ? 'border-primary-500 opacity-100 scale-110' : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              {media.type === 'video' ? (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              ) : (
                <img src={media.url} className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaModal;
