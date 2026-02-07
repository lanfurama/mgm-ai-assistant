# Hướng dẫn Deploy

Ứng dụng MGM AI Assistant chỉ cần frontend static. Không cần backend hay database.

## Kiến trúc

- **Frontend**: React + Vite
- **Vertex AI**: Gọi trực tiếp từ trình duyệt (Gemini API)
- **Lưu trữ**: localStorage (dữ liệu lưu trên máy người dùng)

## Build

```bash
npm run build
```

Output: thư mục `dist/` chứa các file tĩnh (HTML, JS, CSS).

## Deploy

### Option 1: Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;
    try_files $uri $uri/ /index.html;
}
```

### Option 2: CDN / Static Hosting

Upload toàn bộ nội dung thư mục `dist/` lên:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront

## Environment Variables

Cấu hình qua file `.env` khi build:

```bash
VITE_VERTEX_AI_API_KEY=your_key
VITE_VERTEX_AI_PROJECT_ID=your_project_id
VITE_VERTEX_AI_LOCATION=europe-west4
VITE_VERTEX_AI_ENDPOINT_ID=your_endpoint_id
```

## Lưu ý

- Dữ liệu products lưu trong localStorage của trình duyệt
- Mỗi máy/trình duyệt có dữ liệu riêng, không đồng bộ
- Xóa cache/trình duyệt sẽ mất dữ liệu
