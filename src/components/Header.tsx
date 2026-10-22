import React from 'react';

interface HeaderProps {
  currentSection: 'all' | 'show' | 'idea';
  onSectionChange: (section: 'all' | 'show' | 'idea') => void;
  onUploadClick: () => void;
  isAuthenticated: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentSection,
  onSectionChange,
  onUploadClick,
  isAuthenticated,
  onLoginClick,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">F</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
              FashionArchive
            </h1>
          </div>

          {/* Section Tabs */}
          <nav className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => onSectionChange('all')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentSection === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => onSectionChange('show')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentSection === 'show'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Показы
            </button>
            <button
              onClick={() => onSectionChange('idea')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentSection === 'idea'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Идеи
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={onUploadClick}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Загрузить</span>
              </button>
            )}
            {isAuthenticated ? (
              <button
                onClick={onLogout}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Выйти
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Войти
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
