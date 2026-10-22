# FashionArchive — Архив модных фотографий

Приложение для сохранения и каталогизации фотографий с модных показов, идей для шитья, вязания и создания бижутерии.

## 🚀 Деплой на сервер

### 1. Клонирование и сборка

```bash
cd /usr/src/code
git clone https://github.com/КОНЕЧНО/ВАШ.git fashionarchive
cd fashionarchive
nvm use 18
npm install
npm run build
```

### 2. Копирование в папку сайта

```bash
mkdir -p /var/www/fashionarchive
cp -r dist/* /var/www/fashionarchive/
```

### 3. Настройка Nginx

Создайте конфиг `/etc/nginx/sites-available/fashionarchive`:

```nginx
server {
    listen 80;
    server_name fashionarchive.duckdns.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fashionarchive.duckdns.org;

    ssl_certificate /etc/letsencrypt/live/fashionarchive.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fashionarchive.duckdns.org/privkey.pem;

    client_max_body_size 50M;

    # API PocketBase
    location /api/ {
        proxy_pass http://127.0.0.1:8090/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Фронтенд
    location / {
        root /var/www/fashionarchive;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/fashionarchive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
certbot --nginx -d fashionarchive.duckdns.org --redirect
```

### 4. Настройка PocketBase

#### Создайте коллекцию `entries`:

Зайдите в админку PocketBase (через SSH туннель):
```bash
ssh -L 8090:localhost:8090 root@31.59.126.197
# Откройте http://localhost:8090/_/
```

**Поля коллекции `entries`:**

| Поле | Тип | Описание |
|------|-----|----------|
| `title` | Text | Название показа (SS27, FW26-27...) |
| `designer` | Text | Дизайнер (CHANEL, DIOR...) |
| `tags` | JSON | Массив тегов |
| `section` | Select | `show` (показ) или `idea` (идея) |
| `photos` | File (multiple) | Фотографии |
| `notes` | Text (long) | Заметки |

**API Rules для `entries`:**
- List: `@request.auth.id != ""`
- View: `@request.auth.id != ""`
- Create: `@request.auth.id != ""`
- Update: `@request.auth.id != ""`
- Delete: `@request.auth.id != ""`

#### Создайте пользователя:
В админке PocketBase → Collections → users → Create

## 📱 Использование

### Разделы
- **Показы** — фотографии с модных показов (с указанием дизайнера и названия)
- **Идеи** — идеи для шитья, вязания, бижутерии

### Загрузка
1. Нажмите "Загрузить"
2. Выберите раздел (Показ или Идея)
3. Заполните поля (дизайнер, название показа, теги)
4. Прикрепите фото (можно несколько — это будут ракурсы одной вещи)
5. Нажмите "Сохранить"

### Автодополнение
- Дизайнеры, названия показов и теги, которые вы уже использовали, автоматически появляются в выпадающих списках

### Фильтрация
- По дизайнеру
- По названию показа
- По тегам (можно несколько)
- Поиск по заметкам

### Просмотр
- Клик на фото — полный просмотр
- Зум (кнопки + pinch на мобильных)
- Навигация между фото (стрелки)
- Полоска миниатюр для групп из нескольких фото

## 📸 Оптимизация фото

При загрузке фотографии автоматически:
- Уменьшаются до 2048px по большей стороне
- Конвертируются в JPEG (качество 85%)
- Это обеспечивает хорошее качество при просмотре и экономит место

При просмотре в сетке используются миниатюры (thumbs) от PocketBase.

## 🔧 Технологии

- React + TypeScript + Vite
- Tailwind CSS
- PocketBase (бэкенд)
- react-zoom-pan-pinch (зум фото)
- Клиентская оптимизация изображений (Canvas API)
