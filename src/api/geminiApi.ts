import { config } from '../config/env';
import { GeminiProductResponse } from '../types';

export class GeminiApiError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'GeminiApiError';
  }
}

export const getProductDescriptions = async (
  productNames: string[]
): Promise<GeminiProductResponse[]> => {
  if (!config.vertexApiKey) {
    throw new GeminiApiError('VITE_VERTEX_AI_API_KEY is not configured');
  }

  if (!config.vertexProjectId || !config.vertexLocation) {
    throw new GeminiApiError('VITE_VERTEX_AI_PROJECT_ID or VITE_VERTEX_AI_LOCATION is not configured');
  }

  if (!productNames || productNames.length === 0) {
    throw new GeminiApiError('Product names array is empty');
  }

  try {
    const url =
      `https://${config.vertexLocation}-aiplatform.googleapis.com/v1/projects/` +
      `${config.vertexProjectId}/locations/${config.vertexLocation}` +
      `/publishers/google/models/gemini-1.5-flash:generateContent` +
      `?key=${encodeURIComponent(config.vertexApiKey)}`;

    const prompt = `Bạn là chuyên gia quản lý nội dung sản phẩm cho siêu thị.
NHIỆM VỤ: Viết mô tả chi tiết cho các sản phẩm, BẮT BUỘC tuân thủ đúng cấu trúc (format) dưới đây.

CẤU TRÚC BÀI VIẾT (Mô phỏng chính xác mẫu này):

[Đoạn mở đầu: Viết 1 đoạn văn (khoảng 3-4 câu) giới thiệu hấp dẫn về sản phẩm, mô tả hương vị, đặc điểm nổi bật và trải nghiệm khi sử dụng. Văn phong lôi cuốn, kích thích vị giác/nhu cầu.]

– Thành phần: [Tự suy luận thành phần hợp lý nhất dựa trên tên sản phẩm. Ví dụ: Đường, Nước, Bột mì... Liệt kê cụ thể.]

– Xuất xứ: [Suy luận quốc gia dựa trên thương hiệu hoặc để mặc định là Việt Nam nếu là hàng nội địa.]

– Hướng dẫn sử dụng: [Ví dụ: Dùng trực tiếp ngay sau khi mở bao bì. Chế biến trước khi ăn...]

– Hướng dẫn bảo quản: [Ví dụ: Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp.]

– Thông tin cảnh báo an toàn: [Ví dụ: Không sử dụng sản phẩm khi hết hạn sử dụng hoặc có dấu hiệu hư hỏng. Lưu ý dị ứng...]

[Đoạn kết: 1-2 câu ngắn gọn chốt lại chất lượng sản phẩm và lời mời mua hàng khéo léo.]

YÊU CẦU KỸ THUẬT:
1. BẮT BUỘC: Giữ nguyên tên sản phẩm trong trường "name" y hệt đầu vào.
2. Nội dung các mục (Thành phần, Xuất xứ...) phải được AI tự động suy luận một cách logic và hợp lý nhất với loại sản phẩm đó.
3. Giữ đúng các dấu gạch ngang (–) đầu dòng. TUYỆT ĐỐI KHÔNG SỬ DỤNG DẤU SAO (**) TRONG BÀI VIẾT.
4. Trả về định dạng JSON array chuẩn.

DANH SÁCH SẢN PHẨM CẦN VIẾT: ${productNames.join(' | ')}`;

    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new GeminiApiError(
        `Vertex AI request failed with status ${response.status}: ${errorText}`,
        String(response.status),
      );
    }

    const json = await response.json() as any;
    const text: string | undefined =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ??
      json?.candidates?.[0]?.output_text ??
      json?.candidates?.[0]?.text;

    if (!text) {
      throw new GeminiApiError("AI không trả về dữ liệu.", 'NO_RESPONSE');
    }

    const results = JSON.parse(text.trim()) as GeminiProductResponse[];

    if (!Array.isArray(results)) {
      throw new GeminiApiError("AI trả về định dạng không hợp lệ.", 'INVALID_FORMAT');
    }

    return results;
  } catch (error) {
    if (error instanceof GeminiApiError) {
      throw error;
    }
    console.error("Lỗi Vertex AI (Gemini):", error);
    throw new GeminiApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      'API_ERROR'
    );
  }
};
