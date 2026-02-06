import React, { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { parseExcelFile } from '../utils/excelUtils';

interface ProductInputProps {
  onAddProducts: (names: string[]) => Promise<void>;
  isLoading?: boolean;
  onError?: (error: string) => void;
  onSuccess?: (count: number) => void;
}

export const ProductInput: React.FC<ProductInputProps> = ({ 
  onAddProducts, 
  isLoading = false,
  onError,
  onSuccess,
}) => {
  const [inputText, setInputText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleManualAdd = async () => {
    if (!inputText.trim() || isAdding) return;
    const names = inputText.split('\n').filter(n => n.trim() !== '');
    if (names.length > 0) {
      setIsAdding(true);
      setFileError(null);
      try {
        await onAddProducts(names);
        setInputText('');
        onSuccess?.(names.length);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Không thể thêm sản phẩm';
        setFileError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || isAdding) return;

    setIsAdding(true);
    setFileError(null);
    try {
      const names = await parseExcelFile(file);
      await onAddProducts(names);
      onSuccess?.(names.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể đọc tệp Excel. Vui lòng kiểm tra lại định dạng.";
      setFileError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsAdding(false);
      event.target.value = '';
    }
  };

  const isProcessing = isLoading || isAdding;

  return (
    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">
        Đầu vào hàng hoá
      </h2>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Nhập tên sản phẩm...&#10;Ví dụ: Sữa đặc Ông Thọ"
        disabled={isProcessing}
        className="w-full h-40 p-4 text-sm border border-slate-100 bg-slate-50/50 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all resize-none placeholder:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        onClick={handleManualAdd}
        disabled={isProcessing || !inputText.trim()}
        className="w-full mt-4 bg-emerald-600 text-white font-bold py-3 rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isAdding ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang thêm...</span>
          </>
        ) : (
          'Thêm vào danh sách'
        )}
      </button>
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100"></div>
        </div>
        <div className="relative flex justify-center text-[10px] text-slate-300 uppercase font-black tracking-tighter">
          <span className="px-3 bg-white">Hoặc dùng File</span>
        </div>
      </div>
      <label className={`group flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl transition-all ${
        isProcessing 
          ? 'border-slate-200 bg-slate-50 cursor-not-allowed' 
          : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 cursor-pointer'
      }`}>
        {isAdding ? (
          <>
            <Loader2 className="w-6 h-6 mb-2 text-emerald-500 animate-spin" />
            <span className="text-xs font-bold text-emerald-600">Đang xử lý file...</span>
          </>
        ) : (
          <>
            <Upload className={`w-6 h-6 mb-2 transition-colors ${
              isProcessing 
                ? 'text-slate-300' 
                : 'text-slate-300 group-hover:text-emerald-500'
            }`} />
            <span className={`text-xs font-bold transition-colors ${
              isProcessing 
                ? 'text-slate-300' 
                : 'text-slate-400 group-hover:text-emerald-600'
            }`}>
              Chọn file Excel (.xlsx)
            </span>
          </>
        )}
        <input
          type="file"
          className="hidden"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          disabled={isProcessing}
        />
      </label>
      {fileError && (
        <div className="mt-4 text-xs text-red-600 font-medium">
          {fileError}
        </div>
      )}
    </section>
  );
};
