# Hướng dẫn Deploy

## Cấu hình API Base URL

### Development (Local)
Không cần cấu hình gì, mặc định sẽ dùng relative URLs và Vite proxy sẽ xử lý.

### Production với Reverse Proxy (Recommended)

**Cách 1: Relative URLs (Khuyến nghị)**
- Để `VITE_API_BASE_URL` trống hoặc không set
- Frontend sẽ tự động dùng relative URLs (`/api/...`)
- Cấu hình reverse proxy (nginx/Apache) để forward `/api/*` tới backend

**Ví dụ nginx config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve frontend static files
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Backend CORS:**
- Set `FRONTEND_URL=*` trong backend `.env` để cho phép tất cả origins (khi dùng reverse proxy)
- Hoặc set `FRONTEND_URL=https://your-domain.com` nếu muốn restrict

**Cách 2: Absolute URL**
- Set `VITE_API_BASE_URL=https://api.your-domain.com` trong frontend `.env`
- Backend chạy trên domain khác
- Set `FRONTEND_URL=https://your-domain.com` trong backend `.env`

## Lợi ích của Relative URLs

1. **Không cần đổi config khi deploy** - Luôn dùng `/api/...` 
2. **Hoạt động với reverse proxy** - Frontend và backend cùng domain
3. **Tránh CORS issues** - Cùng origin
4. **Dễ scale** - Có thể thay đổi backend URL ở reverse proxy level

## Environment Variables

### Frontend (.env)
```bash
# Để trống để dùng relative URLs
VITE_API_BASE_URL=

# Hoặc set absolute URL nếu cần
# VITE_API_BASE_URL=https://api.example.com
```

### Backend (.env)
```bash
# Cho phép tất cả origins (khi dùng reverse proxy)
FRONTEND_URL=*

# Hoặc set specific origin
# FRONTEND_URL=https://your-domain.com

# Hoặc multiple origins
# FRONTEND_URL=https://domain1.com,https://domain2.com
```
