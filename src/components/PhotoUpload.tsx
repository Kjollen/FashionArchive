import React, { useState, useRef } from 'react';
import { AutoCompleteOptions } from '../types';
import { optimizeFiles, formatFileSize } from '../lib/imageOptimizer';

interface PhotoUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    designer: string;
    tags: string[];
    section: 'show' | 'idea';
    notes: string;
    photos: File[];
  }) => Promise<void>;
  autoComplete: AutoCompleteOptions;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  isOpen,
  onClose,
  onSubmit,
  autoComplete,
}) => {
  const [section, setSection] = useState<'show' | 'idea'>('show');
  const [title, setTitle] = useState('');
  const [designer, setDesigner] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [showDesignerDropdown, setShowDesignerDropdown] = useState(false);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const designerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles) return;
    const fileArray = Array.from(newFiles).filter((f) =>
      f.type.startsWith('image/')
    );

    setOptimizing(true);
    const optimized = await optimizeFiles(fileArray);
    setOptimizing(false);

    setFiles((prev) => [...prev, ...optimized]);

    // Создаём превью
    const newPreviews = optimized.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
    setShowTagDropdown(false);
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        designer: designer.trim(),
        tags,
        section,
        notes: notes.trim(),
        photos: files,
      });
      // Reset
      setTitle('');
      setDesigner('');
      setTags([]);
      setNotes('');
      setFiles([]);
      previews.forEach((p) => URL.revokeObjectURL(p));
      setPreviews([]);
      setSection('show');
      onClose();
    } catch (e) {
      console.error('Submit error:', e);
      alert('Ошибка при сохранении. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDesigners = autoComplete.designers.filter((d) =>
    d.toLowerCase().includes(designer.toLowerCase())
  );
  const filteredShows = autoComplete.shows.filter((s) =>
    s.toLowerCase().includes(title.toLowerCase())
  );
  const filteredTags = autoComplete.tags.filter(
    (t) =>
      t.toLowerCase().includes(tagInput.toLowerCase()) &&
      !tags.includes(t)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Новая запись
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Section Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setSection('show')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                section === 'show'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              👗 Показ
            </button>
            <button
              onClick={() => setSection('idea')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                section === 'idea'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              💡 Идея
            </button>
          </div>

          {/* Designer */}
          <div ref={designerRef} className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Дизайнер
            </label>
            <input
              type="text"
              value={designer}
              onChange={(e) => {
                setDesigner(e.target.value);
                setShowDesignerDropdown(true);
              }}
              onFocus={() => setShowDesignerDropdown(true)}
              onBlur={() => setTimeout(() => setShowDesignerDropdown(false), 200)}
              placeholder="CHANEL, DIOR..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 uppercase"
            />
            {showDesignerDropdown && filteredDesigners.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-32 overflow-y-auto">
                {filteredDesigners.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setDesigner(d);
                      setShowDesignerDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 uppercase"
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Show Title */}
          {section === 'show' && (
            <div ref={titleRef} className="relative">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Название показа
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setShowTitleDropdown(true);
                }}
                onFocus={() => setShowTitleDropdown(true)}
                onBlur={() => setTimeout(() => setShowTitleDropdown(false), 200)}
                placeholder="SS27, FW26-27..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 uppercase"
              />
              {showTitleDropdown && filteredShows.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-32 overflow-y-auto">
                  {filteredShows.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setTitle(s);
                        setShowTitleDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 uppercase"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          <div ref={tagRef} className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Теги
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded-xl min-h-[42px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-900 text-white rounded-md text-xs"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-gray-300">
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setShowTagDropdown(true);
                }}
                onFocus={() => setShowTagDropdown(true)}
                onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? 'Добавить тег...' : ''}
                className="flex-1 min-w-[80px] bg-transparent text-sm focus:outline-none py-0.5"
              />
            </div>
            {showTagDropdown && filteredTags.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-32 overflow-y-auto">
                {filteredTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => addTag(t)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Заметки
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Описание, мысли, ссылки..."
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 resize-none"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Фотографии {files.length > 0 && `(${files.length})`}
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {optimizing ? (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-2" />
                  <p className="text-sm text-gray-500">Оптимизация...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500">
                    Нажмите для выбора фото
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Несколько фото = разные ракурсы одной вещи
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />

            {/* Photo Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {previews.map((preview, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img
                      src={preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-1">
                      <span className="text-[9px] text-white/80">
                        {formatFileSize(files[i]?.size || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={files.length === 0 || submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
