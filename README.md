# FashionArchive — Архив модных фотографий

Приложение для сохранения и каталогизации фотографий с модных показов, идей для шитья, вязания и создания бижутерии.

**Домен:** `fashionarchive.duckdns.org` (или любой другой, который ты настроила)

---

## 🚀 Деплой на сервер (пошагово)

### Шаг 1. Подключаемся к серверу

Открой терминал (Mac/Linux) или PowerShell (Windows) и подключись:

```bash
ssh root@31.59.126.197
```

Введи пароль от сервера.

### Шаг 2. Клонируем приложение

```bash
cd /usr/src/code
git clone https://github.com/Kjollen/FashionArchive.git
cd FashionArchive
```

### Шаг 3. Собираем приложение

```bash
nvm use 18
npm install
npm run build
```

### Шаг 4. Копируем файлы в папку сайта

```bash
mkdir -p /var/www/fashionarchive
cp -r dist/* /var/www/fashionarchive/
```

### Шаг 5. Создаём конфиг Nginx

```bash
nano /etc/nginx/sites-available/fashionarchive
```

Вставь этот текст:

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

Сохрани: **Ctrl+O** → Enter → **Ctrl+X**

### Шаг 6. Включаем сайт

```bash
ln -s /etc/nginx/sites-available/fashionarchive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Шаг 7. Получаем HTTPS

```bash
certbot --nginx -d fashionarchive.duckdns.org --redirect
```

Следуй инструкциям (введи email, согласись с условиями).

✅ **Готово!** Открой https://fashionarchive.duckdns.org

---

## 🔐 Настройка PocketBase

### 1. Подключаемся через SSH-туннель

На своём компьютере (НЕ на сервере):

```bash
ssh -L 8090:localhost:8090 root@31.59.126.197
```

Открой в браузере: **http://localhost:8090/_/**

### 2. Создаём коллекцию пользователей

1. Слева: **Collections** → кнопка **"New collection"**
2. Название: `fashion_users`
3. Тип: **Auth** (обязательно!)
4. Нажми **"Create"**

### 3. Создаём коллекцию записей

1. Снова **"New collection"**
2. Название: `entries`
3. Добавь поля (кнопка **"New field"**):

| Поле | Тип поля | Настройки |
|------|----------|-----------|
| `title` | Text | — |
| `designer` | Text | — |
| `tags` | **JSON** | — |
| `section` | **Select** | Добавь 2 варианта: `show` и `idea` |
| `photos` | **File** | Max selects: 10 (или сколько хочешь) |
| `notes` | Text | Поставь галочку "Present field as multi-line text" |

4. Нажми **"Create"**

### 4. Настраиваем права доступа

Для коллекции **`entries`** нажми на иконку ключа 🔑 (API Rules) и везде поставь:
```
@request.auth.id != ""
```

### 5. Создаём свой аккаунт

1. Слева выбери коллекцию **`fashion_users`**
2. Кнопка **"New auth record"** (справа сверху)
3. Введи email и пароль (минимум 10 символов)
4. Сохрани

✅ **Этот email и пароль** используй для входа в FashionArchive. Он изолирован от MoneyMap!

---

## 📱 Использование

### Разделы
- **Показы** — фотографии с модных показов (с указанием дизайнера и названия)
- **Идеи** — идеи для шитья, вязания, бижутерии

### Загрузка
1. Нажми **"Войти"** → введи email и пароль из `fashion_users`
2. Нажми **"Загрузить"**
3. Выбери раздел (Показ или Идея)
4. Заполни поля (дизайнер, название показа, теги)
5. Прикрепи фото (можно несколько — это будут ракурсы одной вещи)
6. Нажми **"Сохранить"**

### Автодополнение
Дизайнеры, названия показов и теги, которые ты уже использовала, автоматически появляются в выпадающих списках.

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

---

## 📸 Оптимизация фото

При загрузке фотографии автоматически:
- Уменьшаются до 2048px по большей стороне
- Конвертируются в JPEG (качество 85%)
- Это обеспечивает хорошее качество при просмотре и экономит место

При просмотре в сетке используются миниатюры (thumbs) от PocketBase.

---

## 🔧 Технологии

- React + TypeScript + Vite
- Tailwind CSS
- PocketBase (бэкенд)
- react-zoom-pan-pinch (зум фото)
- Клиентская оптимизация изображений (Canvas API)

---

## ⚠️ Важные нюансы

1. **Домен:** `fashionarchive.duckdns.org` (создай на duckdns.org)
2. **PocketBase:** использует ту же базу, но отдельную auth-коллекцию `fashion_users`
3. **Изоляция:** логины FashionArchive полностью независимы от MoneyMap
4. **HTTPS:** настраивается через certbot (см. Шаг 7)
5. **Nginx:** конфиг отдельный, не трогает MoneyMap

---

## 🐛 Если что-то сломалось

```bash
# Логи Nginx
tail -30 /var/log/nginx/error.log

# Проверить конфиг Nginx
sudo nginx -t

# Перезапустить Nginx
sudo systemctl reload nginx

# Проверить, что PocketBase работает
sudo systemctl status pocketbase
```

---

**Версия:** 1.0
**Дата:** 2026
