import React from 'react';
import { Entry } from '../types';

interface PhotoCardProps {
  entry: Entry;
  getImageUrl: (entry: Entry, filename: string, thumb?: string) => string;
  onClick: () => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ entry, getImageUrl, onClick }) => {
  const photos = entry.photos || [];
  const firstPhoto = photos[0];
  const hasMultiple = photos.length > 1;

  const parsedTags = typeof entry.tags === 'string'
    ? (() => { try { return JSON.parse(entry.tags); } catch { return []; } })()
    : (entry.tags || []);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
    >
      {/* Photo Grid */}
      <div className={`relative ${hasMultiple && photos.length <= 4 ? 'aspect-square' : 'aspect-[4/5]'}`}>
        {photos.length === 0 && (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-400">Нет фото</span>
            </div>
          </div>
        )}
        {photos.length === 1 && (
          <img
            src={getImageUrl(entry, firstPhoto, '400x500')}
            alt={entry.title || entry.designer}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {photos.length === 2 && (
          <div className="grid grid-cols-2 w-full h-full">
            {photos.slice(0, 2).map((photo, i) => (
              <img
                key={i}
                src={getImageUrl(entry, photo, '200x250')}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ))}
          </div>
        )}
        {photos.length === 3 && (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
            <img
              src={getImageUrl(entry, photos[0], '200x250')}
              alt=""
              className="row-span-2 w-full h-full object-cover"
              loading="lazy"
            />
            {photos.slice(1, 3).map((photo, i) => (
              <img
                key={i}
                src={getImageUrl(entry, photo, '200x125')}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ))}
          </div>
        )}
        {photos.length >= 4 && (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
            {photos.slice(0, 4).map((photo, i) => (
              <img
                key={i}
                src={getImageUrl(entry, photo, '200x250')}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ))}
          </div>
        )}

        {/* Multiple photos badge */}
        {hasMultiple && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full">
            {photos.length} фото
          </div>
        )}

        {/* Section badge */}
        <div className={`absolute top-2 left-2 px-2 py-0.5 backdrop-blur-sm text-xs rounded-full font-medium ${
          entry.section === 'show'
            ? 'bg-white/80 text-gray-700'
            : 'bg-amber-100/80 text-amber-800'
        }`}>
          {entry.section === 'show' ? '👗 Показ' : '💡 Идея'}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {entry.designer && (
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide truncate">
                {entry.designer}
              </p>
            )}
            {entry.title && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {entry.title}
              </p>
            )}
          </div>
        </div>

        {/* Tags */}
        {parsedTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {parsedTags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-md"
              >
                {tag}
              </span>
            ))}
            {parsedTags.length > 3 && (
              <span className="px-1.5 py-0.5 text-gray-400 text-[10px]">
                +{parsedTags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Notes preview */}
        {entry.notes && (
          <p className="text-xs text-gray-400 mt-1.5 truncate">
            {entry.notes}
          </p>
        )}
      </div>
    </div>
  );
};

export default PhotoCard;
