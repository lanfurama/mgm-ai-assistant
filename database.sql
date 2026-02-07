-- DEPRECATED: Không dùng khi chạy chỉ với Vertex AI (frontend + localStorage).
-- File này chỉ để tham khảo cho kiến trúc backend cũ.

-- Enable pg_trgm extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enum cho trạng thái sản phẩm
CREATE TYPE product_status AS ENUM ('pending', 'processing', 'completed', 'error');

-- Bảng lưu sản phẩm + mô tả AI
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    status          product_status NOT NULL DEFAULT 'pending',
    source          TEXT NOT NULL DEFAULT 'manual', -- manual | excel | api
    error_message   TEXT,                           -- nếu AI lỗi
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index phục vụ search theo tên và trạng thái
CREATE INDEX idx_products_name_btree ON products (name);
CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_created_at ON products (created_at DESC);

-- Trigger tự update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Bảng log request tới AI (phục vụ debug/audit sau này)
CREATE TABLE ai_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider        TEXT NOT NULL DEFAULT 'vertex-ai',
    model           TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    product_ids     UUID[] NOT NULL,        -- batch ids
    prompt          TEXT NOT NULL,
    raw_response    TEXT,                   -- JSON trả về thô
    status          TEXT NOT NULL DEFAULT 'success', -- success | error
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_requests_created_at ON ai_requests (created_at DESC);
