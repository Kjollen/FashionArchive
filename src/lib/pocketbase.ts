import PocketBase from 'pocketbase';

// URL PocketBase API — на сервере это будет тот же домен
const PB_URL = import.meta.env.VITE_PB_URL || window.location.origin;

const pb = new PocketBase(PB_URL);

// Настройки клиента PocketBase

export default pb;

export async function getEntries(page = 1, perPage = 50, filter = '') {
  const options: any = {
    page,
    perPage,
    sort: '-created',
    expand: '',
  };
  if (filter) {
    options.filter = filter;
  }
  return pb.collection('entries').getList(page, perPage, options);
}

export async function createEntry(data: {
  title: string;
  designer: string;
  tags: string;
  section: string;
  notes: string;
  photos: File[];
}) {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('designer', data.designer);
  formData.append('tags', data.tags);
  formData.append('section', data.section);
  formData.append('notes', data.notes);
  
  // Добавляем все фото
  data.photos.forEach((file) => {
    formData.append('photos', file);
  });

  return pb.collection('entries').create(formData);
}

export async function updateEntry(id: string, data: {
  title?: string;
  designer?: string;
  tags?: string;
  section?: string;
  notes?: string;
  photos?: File[];
}) {
  const formData = new FormData();
  if (data.title !== undefined) formData.append('title', data.title);
  if (data.designer !== undefined) formData.append('designer', data.designer);
  if (data.tags !== undefined) formData.append('tags', data.tags);
  if (data.section !== undefined) formData.append('section', data.section);
  if (data.notes !== undefined) formData.append('notes', data.notes);
  if (data.photos) {
    data.photos.forEach((file) => {
      formData.append('photos', file);
    });
  }
  return pb.collection('entries').update(id, formData);
}

export async function deleteEntry(id: string) {
  return pb.collection('entries').delete(id);
}

export async function getAutoCompleteOptions(): Promise<{
  designers: string[];
  shows: string[];
  tags: string[];
}> {
  try {
    const result = await pb.collection('entries').getList(1, 500, {
      sort: '-created',
      fields: 'title,designer,tags',
    });

    const designers = new Set<string>();
    const shows = new Set<string>();
    const tags = new Set<string>();

    result.items.forEach((item: any) => {
      if (item.designer) designers.add(item.designer);
      if (item.title) shows.add(item.title);
      if (item.tags) {
        const parsedTags = typeof item.tags === 'string' 
          ? JSON.parse(item.tags) 
          : item.tags;
        if (Array.isArray(parsedTags)) {
          parsedTags.forEach((t: string) => {
            if (t.trim()) tags.add(t.trim());
          });
        }
      }
    });

    return {
      designers: Array.from(designers).sort(),
      shows: Array.from(shows).sort(),
      tags: Array.from(tags).sort(),
    };
  } catch (e) {
    console.error('Error fetching autocomplete options:', e);
    return { designers: [], shows: [], tags: [] };
  }
}

export function getFileUrl(record: any, filename: string, params?: { thumb?: string }) {
  return pb.files.getUrl(record, filename, params);
}

// Используем отдельную auth-коллекцию для изоляции от MoneyMap
const AUTH_COLLECTION = 'fashion_users';

export async function login(email: string, password: string) {
  return pb.collection(AUTH_COLLECTION).authWithPassword(email, password);
}

export async function register(email: string, password: string) {
  return pb.collection(AUTH_COLLECTION).create({
    email,
    password,
    passwordConfirm: password,
  });
}

export function isAuthenticated() {
  return pb.authStore.isValid;
}

export function logout() {
  pb.authStore.clear();
}

export function getCurrentUser() {
  return pb.authStore.model;
}
