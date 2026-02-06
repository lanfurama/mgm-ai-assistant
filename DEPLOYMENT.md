# Hướng dẫn Deploy

## Auto-Detect Server IP/Domain

Hệ thống tự động phát hiện IP/domain của server khi chạy, không cần cấu hình thủ công.

### Frontend Auto-Detection
- Nếu không set `VITE_API_BASE_URL`, frontend sẽ tự động detect từ `window.location`
- Tự động sử dụng IP/domain của server hiện tại
- Nếu cùng origin/port → dùng relative URLs (tốt nhất)
- Nếu khác port → tự động build URL từ hostname hiện tại

### Backend Auto-Detection  
- Tự động detect và log ra tất cả IP addresses của server
- CORS tự động cho phép tất cả origins nếu không set `FRONTEND_URL`
- Log ra các URL có thể truy cập (localhost + network IPs)

## Cấu hình API Base URL

### Development (Local)
Không cần cấu hình gì, mặc định sẽ dùng relative URLs và Vite proxy sẽ xử lý.

### Production - Auto-Detect (Khuyến nghị)

**Cách 1: Auto-Detect (Khuyến nghị - Không cần config)**
- Để `VITE_API_BASE_URL` trống hoặc không set
- Frontend tự động detect IP/domain của server từ `window.location`
- Nếu cùng origin → dùng relative URLs (`/api/...`)
- Nếu khác port → tự động build URL từ hostname hiện tại
- Backend tự động detect và log ra tất cả IP addresses
- Set `FRONTEND_URL=*` trong backend để cho phép tất cả origins

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

## Lợi ích của Auto-Detection

1. **Không cần config khi deploy** - Tự động detect IP/domain của server
2. **Hoạt động trên mọi server** - Tự động adapt với IP/domain hiện tại
3. **Không cần đổi localhost** - Tự động chuyển sang IP của server khi deploy
4. **Hoạt động với reverse proxy** - Frontend và backend cùng domain
5. **Tránh CORS issues** - Tự động allow origins
6. **Dễ debug** - Backend log ra tất cả IP addresses có thể truy cập

## Environment Variables

### Frontend (.env)
```bash
# Để trống để tự động detect IP/domain của server
# Frontend sẽ tự động detect từ window.location
VITE_API_BASE_URL=

# Optional: Set backend port nếu khác 8000
# VITE_API_PORT=8000

# Hoặc set absolute URL nếu muốn override auto-detect
# VITE_API_BASE_URL=https://api.example.com
```

### Backend (.env)
```bash
# Cho phép tất cả origins - tự động detect (khuyến nghị)
FRONTEND_URL=*

# Hoặc set specific origin
# FRONTEND_URL=https://your-domain.com

# Hoặc multiple origins
# FRONTEND_URL=https://domain1.com,https://domain2.com
```

## Ví dụ khi deploy

### Server IP: 192.168.1.100

**Frontend:**
- Không cần config gì
- Tự động detect: `http://192.168.1.100:3004`
- API calls tự động đi tới: `http://192.168.1.100:8000` (hoặc relative `/api/...`)

**Backend:**
- Set `FRONTEND_URL=*` 
- Backend tự động log:
  ```
  === Server Started ===
  Local:   http://localhost:8000
  Network:
           http://192.168.1.100:8000
  ```

Không cần đổi localhost thành IP thủ công!
