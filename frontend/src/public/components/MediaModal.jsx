import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';

const MediaModal = ({ isOpen, onClose, images, videoUrl }) => {
  // Extract media items safely (handling both strings and objects)
  const allMedia = [];
  if (videoUrl) allMedia.push({ type: 'video', url: videoUrl });
  if (images && Array.isArray(images)) {
    images.forEach(img => {
      const src = typeof img === 'string' ? img : (img?.url || img?.secure_url);
      if (src) allMedia.push({ type: 'image', url: src });
    });
  }

  const [currentIndex, setCurrentIndex] = useState(0);

  // Keyboard navigation & Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
      }
    };

    // Lock body scroll while modal is open
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, allMedia.length, onClose]);

  if (!isOpen || allMedia.length === 0) return null;

  const handlePrevious = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
  };

  const currentMedia = allMedia[currentIndex] || allMedia[0];

  // Helper for YouTube embed
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=0&controls=1&rel=0` : null;
  };

  const isVideo = currentMedia?.type === 'video';
  const ytEmbed = isVideo ? getYouTubeEmbedUrl(currentMedia.url) : null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(5, 10, 20, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      {/* Top Header Bar: Counter + Prominent Close Button */}
      <div 
        style={{
          position: 'absolute',
          top: '1.25rem',
          left: '1.5rem',
          right: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 100000,
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media counter indicator */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            padding: '0.4rem 0.9rem',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            backdropFilter: 'blur(8px)'
          }}
        >
          {currentIndex + 1} of {allMedia.length}
        </div>

        {/* Prominent, Unmissable Close Button */}
        <button 
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.15)',
            hover: { background: '#d49a3f' },
            border: '1.5px solid rgba(255, 255, 255, 0.35)',
            color: '#ffffff',
            padding: '0.5rem 1.1rem',
            borderRadius: '9999px',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 700,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(8px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#d49a3f';
            e.currentTarget.style.color = '#0f172a';
            e.currentTarget.style.borderColor = '#d49a3f';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span>Close</span>
          <X size={18} />
        </button>
      </div>

      {/* Main Media Center Container */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1200px',
          height: '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Arrow Button */}
        {allMedia.length > 1 && (
          <button 
            type="button"
            onClick={handlePrevious}
            aria-label="Previous image"
            style={{
              position: 'absolute',
              left: '1rem',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 100000,
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(6px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d49a3f';
              e.currentTarget.style.color = '#0f172a';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* Media Content */}
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isVideo ? (
            ytEmbed ? (
              <iframe
                src={ytEmbed}
                title="Property Video Walkthrough"
                style={{ width: '90%', height: '90%', border: 'none', borderRadius: '16px' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video 
                src={currentMedia.url} 
                controls 
                autoPlay
                className="rounded-2xl shadow-2xl"
                style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '16px' }}
              />
            )
          ) : (
            <img 
              src={currentMedia.url} 
              alt={`Property media ${currentIndex + 1}`}
              className="rounded-2xl shadow-2xl select-none"
              style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '16px' }}
            />
          )}
        </div>

        {/* Next Arrow Button */}
        {allMedia.length > 1 && (
          <button 
            type="button"
            onClick={handleNext}
            aria-label="Next image"
            style={{
              position: 'absolute',
              right: '1rem',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 100000,
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(6px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d49a3f';
              e.currentTarget.style.color = '#0f172a';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {allMedia.length > 1 && (
        <div 
          style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: '0.65rem',
            padding: '0 1rem',
            overflowX: 'auto',
            zIndex: 100000,
            pointerEvents: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {allMedia.map((media, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: '74px',
                height: '52px',
                flexShrink: 0,
                borderRadius: '8px',
                overflow: 'hidden',
                border: idx === currentIndex ? '2.5px solid #d49a3f' : '2px solid transparent',
                opacity: idx === currentIndex ? 1 : 0.5,
                transform: idx === currentIndex ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                background: '#0f172a',
                padding: 0
              }}
            >
              {media.type === 'video' ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1120' }}>
                  <Play size={18} fill="#ffffff" color="#ffffff" />
                </div>
              ) : (
                <img src={media.url} alt={`Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaModal;
