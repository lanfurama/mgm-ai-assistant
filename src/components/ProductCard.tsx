import React, { useState } from 'react';
import { Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { StatusBadge } from './StatusBadge';

interface ProductCardProps {
  product: Product;
  onRemove: (id: string) => Promise<void>;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onRemove }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemove = async () => {
    setIsDeleting(true);
    try {
      await onRemove(product.id);
    } catch (err) {
      setIsDeleting(false);
      throw err;
    }
  };

  return (
    <div className="p-6 hover:bg-slate-50/50 transition-all flex gap-5 group">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-bold text-slate-800 text-sm">{product.name}</h4>
          <StatusBadge status={product.status} />
        </div>

        {product.status === 'completed' ? (
          <div className="relative group/text">
            <div className="text-sm text-slate-600 leading-7 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm whitespace-pre-line text-justify">
              {product.description}
            </div>
          </div>
        ) : product.status === 'processing' ? (
          <div className="flex items-center gap-3 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-50/50">
            <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest animate-pulse">
              AI Đang viết bài SEO...
            </span>
          </div>
        ) : product.status === 'error' ? (
          <div className="flex items-center gap-3 p-4 bg-red-50/30 rounded-2xl border border-red-50/50 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">
              Lỗi khớp dữ liệu - Vui lòng thử lại
            </span>
          </div>
        ) : (
          <div className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] mt-2">
            Đang chờ lệnh...
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={handleRemove}
          disabled={isDeleting}
          className={`opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all ${
            isDeleting
              ? 'text-slate-400 cursor-not-allowed opacity-100'
              : 'text-slate-200 hover:text-red-500 hover:bg-red-50'
          }`}
          title={isDeleting ? 'Đang xóa...' : 'Xóa'}
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
