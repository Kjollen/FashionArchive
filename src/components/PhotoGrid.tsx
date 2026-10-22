import React from 'react';
import { Entry } from '../types';
import PhotoCard from './PhotoCard';

interface PhotoGridProps {
  entries: Entry[];
  loading: boolean;
  getImageUrl: (entry: Entry, filename: string, thumb?: string) => string;
  onEntryClick: (entry: Entry) => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({
  entries,
  loading,
  getImageUrl,
  onEntryClick,
}) => {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-gray-100 animate-pulse aspect-[4/5]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Пока нет фотографий
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Загрузите фотографии с модных показов или сохраните идеи для творчества
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {entries.map((entry) => (
          <PhotoCard
            key={entry.id}
            entry={entry}
            getImageUrl={getImageUrl}
            onClick={() => onEntryClick(entry)}
          />
        ))}
      </div>
    </div>
  );
};

export default PhotoGrid;
