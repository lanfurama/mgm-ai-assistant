import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { parseExcelFile } from '../utils/excelUtils';

interface ProductInputProps {
  onAddProducts: (names: string[]) => Promise<void>;
  isLoading?: boolean;
}

export const ProductInput: React.FC<ProductInputProps> = ({ onAddProducts, isLoading = false }) => {
  const [inputText, setInputText] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);

  const handleManualAdd = async () => {
    if (!inputText.trim()) return;
    const names = inputText.split('\n').filter(n => n.trim() !== '');
    if (names.length > 0) {
      try {
        await onAddProducts(names);
        setInputText('');
      } catch (err) {
        setFileError(err instanceof Error ? err.message : 'Failed to add products');
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setFileError(null);
      const names = await parseExcelFile(file);
      await onAddProducts(names);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Không thể đọc tệp Excel. Vui lòng kiểm tra lại định dạng.");
    } finally {
      event.target.value = '';
    }
  };

  return (
    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">
        Đầu vào hàng hoá
      </h2>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Nhập tên sản phẩm...&#10;Ví dụ: Sữa đặc Ông Thọ"
        disabled={isLoading}
        className="w-full h-40 p-4 text-sm border border-slate-100 bg-slate-50/50 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all resize-none placeholder:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        onClick={handleManualAdd}
        disabled={isLoading || !inputText.trim()}
        className="w-full mt-4 bg-emerald-600 text-white font-bold py-3 rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Thêm vào danh sách
      </button>
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100"></div>
        </div>
        <div className="relative flex justify-center text-[10px] text-slate-300 uppercase font-black tracking-tighter">
          <span className="px-3 bg-white">Hoặc dùng File</span>
        </div>
      </div>
      <label className={`group flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
        isLoading 
          ? 'border-slate-200 bg-slate-50 cursor-not-allowed' 
          : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30'
      }`}>
        <Upload className={`w-6 h-6 mb-2 transition-colors ${
          isLoading 
            ? 'text-slate-300' 
            : 'text-slate-300 group-hover:text-emerald-500'
        }`} />
        <span className={`text-xs font-bold transition-colors ${
          isLoading 
            ? 'text-slate-300' 
            : 'text-slate-400 group-hover:text-emerald-600'
        }`}>
          Chọn file Excel (.xlsx)
        </span>
        <input
          type="file"
          className="hidden"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          disabled={isLoading}
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
