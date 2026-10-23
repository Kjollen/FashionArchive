export interface Entry {
  id: string;
  title: string;        // Название показа (SS27, FW26-27...)
  designer: string;     // Дизайнер (CHANEL, DIOR...)
  tags: string[];       // Теги
  section: 'show' | 'idea'; // Раздел: показ или идея
  photos: string[];     // Массив имён файлов
  notes: string;        // Заметки
  userId: string;
  created: string;
  updated: string;
  expand?: {
    [key: string]: any;
  };
}

export interface EntryFormData {
  title: string;
  designer: string;
  tags: string[];
  section: 'show' | 'idea';
  notes: string;
  photos: File[];
}

export interface FilterState {
  section: 'all' | 'show' | 'idea';
  designer: string;
  show: string;
  tags: string[];
  search: string;
}

export interface AutoCompleteOptions {
  designers: string[];
  shows: string[];
  tags: string[];
}
