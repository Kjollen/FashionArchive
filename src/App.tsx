import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Filters from './components/Filters';
import PhotoGrid from './components/PhotoGrid';
import PhotoUpload from './components/PhotoUpload';
import PhotoViewer from './components/PhotoViewer';
import AuthModal from './components/AuthModal';
import { Entry, FilterState, AutoCompleteOptions } from './types';
import pb, {
  getEntries,
  createEntry,
  deleteEntry,
  getAutoCompleteOptions,
  getFileUrl,
  login,
  register,
  isAuthenticated,
  logout as pbLogout,
} from './lib/pocketbase';

function App() {
  // State
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    section: 'all',
    designer: '',
    show: '',
    tags: [],
    search: '',
  });
  const [autoComplete, setAutoComplete] = useState<AutoCompleteOptions>({
    designers: [],
    shows: [],
    tags: [],
  });
  const [showUpload, setShowUpload] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [authed, setAuthed] = useState(isAuthenticated());

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setAuthed(isAuthenticated());
    });
    return unsubscribe;
  }, []);

  // Load entries
  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      // Build filter string
      const filterParts: string[] = [];

      if (filters.section !== 'all') {
        filterParts.push(`section = "${filters.section}"`);
      }
      if (filters.designer) {
        filterParts.push(`designer = "${filters.designer}"`);
      }
      if (filters.show) {
        filterParts.push(`title = "${filters.show}"`);
      }
      if (filters.tags.length > 0) {
        // Filter by tags (JSON field contains tag)
        const tagFilters = filters.tags.map(
          (tag) => `tags ~ "${tag}"`
        );
        filterParts.push(`(${tagFilters.join(' && ')})`);
      }
      if (filters.search) {
        filterParts.push(`notes ~ "${filters.search}"`);
      }

      const filterStr = filterParts.join(' && ');
      const result = await getEntries(1, 100, filterStr);
      setEntries(result.items as unknown as Entry[]);
    } catch (e) {
      console.error('Failed to load entries:', e);
      // Если PocketBase недоступен, показываем пустой список
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load autocomplete options
  const loadAutoComplete = useCallback(async () => {
    try {
      const options = await getAutoCompleteOptions();
      setAutoComplete(options);
    } catch (e) {
      console.error('Failed to load autocomplete:', e);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    loadAutoComplete();
  }, [loadAutoComplete, entries.length]);

  // Get image URL
  const getImageUrl = useCallback(
    (entry: Entry, filename: string, thumb?: string) => {
      try {
        const params = thumb ? { thumb } : undefined;
        return getFileUrl(entry, filename, params);
      } catch {
        // Fallback для демо
        return `image/svg+xml,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" fill="#f3f4f6"><rect width="400" height="500"/><text x="200" y="250" text-anchor="middle" fill="#9ca3af" font-size="14">Фото</text></svg>`
        )}`;
      }
    },
    []
  );

  // Handle upload
  const handleUpload = async (data: {
    title: string;
    designer: string;
    tags: string[];
    section: 'show' | 'idea';
    notes: string;
    photos: File[];
  }) => {
    await createEntry({
      ...data,
      tags: JSON.stringify(data.tags),
    });
    await loadEntries();
    await loadAutoComplete();
  };

  // Handle delete
  const handleDelete = async (entry: Entry) => {
    try {
      await deleteEntry(entry.id);
      await loadEntries();
      await loadAutoComplete();
    } catch (e) {
      console.error('Failed to delete:', e);
      alert('Ошибка при удалении');
    }
  };

  // Auth handlers
  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  const handleRegister = async (email: string, password: string) => {
    await register(email, password);
    await login(email, password);
  };

  const handleLogout = () => {
    pbLogout();
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header
        currentSection={filters.section === 'all' ? 'all' : filters.section as 'show' | 'idea'}
        onSectionChange={(section) =>
          setFilters({ ...filters, section: section as any })
        }
        onUploadClick={() => setShowUpload(true)}
        isAuthenticated={authed}
        onLoginClick={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      <Filters
        filters={filters}
        onFilterChange={setFilters}
        designers={autoComplete.designers}
        shows={autoComplete.shows}
        tags={autoComplete.tags}
      />

      <PhotoGrid
        entries={entries}
        loading={loading}
        getImageUrl={getImageUrl}
        onEntryClick={(entry) => setSelectedEntry(entry)}
      />

      {/* Upload Modal */}
      <PhotoUpload
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSubmit={handleUpload}
        autoComplete={autoComplete}
      />

      {/* Photo Viewer */}
      {selectedEntry && (
        <PhotoViewer
          entry={selectedEntry}
          isOpen={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          getImageUrl={getImageUrl}
          onDelete={authed ? handleDelete : undefined}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-center text-xs text-gray-400">
            FashionArchive — Ваш личный архив модных вдохновений
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
