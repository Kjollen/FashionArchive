import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Entry } from '../types';

interface PhotoViewerProps {
  entry: Entry;
  isOpen: boolean;
  onClose: () => void;
  getImageUrl: (entry: Entry, filename: string, thumb?: string) => string;
  onDelete?: (entry: Entry) => void;
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({
  entry,
  isOpen,
  onClose,
  getImageUrl,
  onDelete,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photos = entry.photos || [];

  if (!isOpen || photos.length === 0) return null;

  const parsedTags = typeof entry.tags === 'string'
    ? (() => { try { return JSON.parse(entry.tags); } catch { return []; } })()
    : (entry.tags || []);

  const goNext = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const goPrev = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/50 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div>
            {entry.designer && (
              <p className="text-white font-semibold text-sm uppercase">
                {entry.designer}
              </p>
            )}
            {entry.title && (
              <p className="text-gray-400 text-xs">{entry.title}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {photos.length > 1 && (
            <span className="text-gray-400 text-sm">
              {currentPhotoIndex + 1} / {photos.length}
            </span>
          )}
          {onDelete && (
            <button
              onClick={() => {
                if (confirm('Удалить эту запись?')) {
                  onDelete(entry);
                  onClose();
                }
              }}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden min-h-0">
        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Zoomable Image */}
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={5}
          centerOnInit
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <TransformComponent
                wrapperClass="!w-full !h-full"
                contentClass="!w-full !h-full flex items-center justify-center"
              >
                <img
                  src={getImageUrl(entry, photos[currentPhotoIndex])}
                  alt=""
                  className="max-w-full max-h-full object-contain select-none"
                  draggable={false}
                />
              </TransformComponent>

              {/* Zoom Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2">
                <button
                  onClick={() => zoomOut()}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="px-2 text-xs text-white/70 hover:text-white"
                >
                  1:1
                </button>
                <button
                  onClick={() => zoomIn()}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Bottom Info */}
      <div className="px-4 py-3 bg-black/50 shrink-0">
        <div className="max-w-2xl mx-auto">
          {/* Tags */}
          {parsedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {parsedTags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-white/10 text-white/80 rounded-md text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {/* Notes */}
          {entry.notes && (
            <p className="text-gray-300 text-sm">{entry.notes}</p>
          )}
          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPhotoIndex(i)}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    i === currentPhotoIndex
                      ? 'border-white scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getImageUrl(entry, photo, '100x100')}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoViewer;
