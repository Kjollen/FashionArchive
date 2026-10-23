# 🧵 FashionArchive — Инструкция по деплою

**Стек:** React + Vite + Tailwind CSS v4 (фронт) + PocketBase (бэкенд)
**Домен:** `fashionarchive.duckdns.org`
**Сервер:** Ubuntu/Debian Linux

---

## Шаг 0. Подготовка сервера

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx unzip curl
```

---

## Шаг 1. Установка PocketBase

```bash
# Скачиваем последнюю версию PocketBase (проверь актуальную на https://pocketbase.io/docs/)
cd /tmp
wget https://github.com/pocketbase/pocketbase/releases/download/v0.25.8/pocketbase_0.25.8_linux_amd64.zip
unzip pocketbase_0.25.8_linux_amd64.zip

# Переносим в рабочую директорию
sudo mkdir -p /opt/pocketbase
sudo mv pocketbase /opt/pocketbase/
sudo chmod +x /opt/pocketbase/pocketbase

# Создаём директорию для данных
sudo mkdir -p /opt/pocketbase/pb_data
sudo mkdir -p /opt/pocketbase/pb_hooks
```

### Создаём systemd-сервис для PocketBase

```bash
sudo nano /etc/systemd/system/pocketbase.service
```

Вставь:

```ini
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=root
ExecStart=/opt/pocketbase/pocketbase serve --http=127.0.0.1:8090 --dir=/opt/pocketbase/pb_data
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Запускаем:

```bash
sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl start pocketbase
sudo systemctl status pocketbase
```

Проверь что PocketBase работает:
```bash
curl http://127.0.0.1:8090/api/health
# Должен вернуть: {"code":200,"message":"API is started."}
```

---

## Шаг 2. Исправление ошибки сборки (lightningcss)

> ⚠️ Если при `npm run build` видишь ошибку:
> `Cannot find native binding. npm has a bug related to optional dependencies`
>
> Это из-за бага npm [#4828](https://github.com/npm/cli/issues/4828) — optional dependency `lightningcss` не ставится корректно в Docker/Linux.

### Решение:

```bash
cd /usr/src/code/FashionArchive

# Полная пересборка node_modules
rm -rf node_modules package-lock.json
npm install

# Сборка
npm run build
```

Если ошибка повторится — добавь `lightningcss` вручную:
```bash
npm install lightningcss
npm run build
```

После успешной сборки появится папка `dist/`.

---

## Шаг 3. Копируем фронтенд в папку Nginx

```bash
sudo mkdir -p /var/www/fashionarchive
sudo cp -r dist/* /var/www/fashionarchive/
sudo chown -R www-data:www-data /var/www/fashionarchive
```

---

## Шаг 4. Конфигурация Nginx

```bash
sudo nano /etc/nginx/sites-available/fashionarchive
```

Вставь **полностью** этот конфиг:

```nginx
server {
    listen 80;
    server_name fashionarchive.duckdns.org;

    # Корневая папка фронтенда
    root /var/www/fashionarchive;
    index index.html;

    # Максимальный размер загружаемых файлов (для фото)
    client_max_body_size 50M;

    # --- PocketBase Admin UI ---
    # Админка доступна по адресу: https://fashionarchive.duckdns.org/admin/
    location /admin/ {
        proxy_pass http://127.0.0.1:8090/_/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # --- PocketBase API ---
    location /api/ {
        proxy_pass http://127.0.0.1:8090/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # --- PocketBase файлы (загруженные фото) ---
    location /files/ {
        proxy_pass http://127.0.0.1:8090/files/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Кэширование файлов на 30 дней
        proxy_cache_valid 200 30d;
        expires 30d;
    }

    # --- Фронтенд (SPA) ---
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кэширование статики Vite
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Активируем:

```bash
sudo ln -sf /etc/nginx/sites-available/fashionarchive /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Проверяем конфиг
sudo nginx -t

# Перезагружаем Nginx
sudo systemctl reload nginx
```

---

## Шаг 5. SSL-сертификат (HTTPS)

```bash
sudo certbot --nginx -d fashionarchive.duckdns.org --redirect
```

Следуй инструкциям (email, согласие). Certbot сам подправит конфиг Nginx.

Проверь автообновление:
```bash
sudo certbot renew --dry-run
```

---

## Шаг 6. Настройка PocketBase (создание коллекций)

### 6.1. Открой админку в браузере:

```
https://fashionarchive.duckdns.org/admin/
```

При первом входе создай аккаунт администратора.

### 6.2. Создай коллекцию `entries`

В админке → **Collections** → **Create collection** → имя: `entries`

Добавь поля:

| Имя поля  | Тип          | Настройки                          |
|-----------|--------------|------------------------------------|
| `title`   | Text         | Required ✅                        |
| `designer`| Text         |                                    |
| `tags`    | Text         |                                    |
| `section` | Text         |                                    |
| `notes`   | Text (long)  |                                    |
| `photos`  | File         | Max selects: 10, Max size: 10MB   |

**Права доступа** (вкладка API Rules):
- **List** (просмотр списка): `@request.auth.id != ""` или пустое (публичный)
- **View** (просмотр одного): пустое (публичный)
- **Create**: `@request.auth.id != ""` (только авторизованные)
- **Update**: `@request.auth.id != ""`
- **Delete**: `@request.auth.id != ""`

### 6.3. Создай коллекцию `fashion_users`

В админке → **Collections** → **Create collection** → имя: `fashion_users`

> ⚠️ Либо используй встроенную коллекцию `users` — тогда в коде нужно заменить `fashion_users` на `users`.

Добавь поля:

| Имя поля | Тип   | Настройки   |
|----------|-------|-------------|
| `name`   | Text  | Required ✅ |
| `email`  | Email | Required ✅ |

---

## Шаг 7. Проверка

1. **Фронтенд:** `https://fashionarchive.duckdns.org/` — должна открыться главная страница
2. **Админка:** `https://fashionarchive.duckdns.org/admin/` — должна открыться админка PocketBase
3. **API:** `https://fashionarchive.duckdns.org/api/health` — должен вернуть `{"code":200,...}`

---

## 🔧 Полезные команды

```bash
# Проверить статус PocketBase
sudo systemctl status pocketbase

# Перезапустить PocketBase
sudo systemctl restart pocketbase

# Логи PocketBase
sudo journalctl -u pocketbase -f

# Перезагрузить Nginx после изменений
sudo systemctl reload nginx

# Обновить фронтенд после изменений в коде
cd /usr/src/code/FashionArchive
npm run build
sudo cp -r dist/* /var/www/fashionarchive/
```

---

## ❗ Частые проблемы

### «Cannot find native binding» при сборке
```bash
rm -rf node_modules package-lock.json
npm install lightningcss
npm install
npm run build
```

### Порт 8090 не отвечает
```bash
sudo systemctl status pocketbase
sudo journalctl -u pocketbase --no-pager -n 50
```

### 502 Bad Gateway от Nginx
PocketBase не запущен:
```bash
sudo systemctl start pocketbase
```

### Фото не загружаются
Увеличь `client_max_body_size` в конфиге Nginx и перезагрузи:
```bash
sudo systemctl reload nginx
```
