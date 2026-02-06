import React from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  products: Product[];
  completedCount: number;
  isLoading?: boolean;
  onRemove: (id: string) => Promise<void>;
  onClearAll: () => Promise<void>;
}

const SkeletonCard = () => (
  <div className="p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-4 bg-slate-200 rounded w-32"></div>
      <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
    </div>
    <div className="h-20 bg-slate-100 rounded-2xl"></div>
  </div>
);

export const ProductList: React.FC<ProductListProps> = ({
  products,
  completedCount,
  isLoading = false,
  onRemove,
  onClearAll,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[850px]">
      <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Đang tải...
              </span>
            </div>
          ) : (
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Danh sách hàng ({products.length})
            </span>
          )}
          {completedCount > 0 && (
            <div className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-tighter">
              {completedCount} Đã xong
            </div>
          )}
        </div>
        {products.length > 0 && !isLoading && (
          <button
            onClick={onClearAll}
            className="text-[10px] font-black text-slate-300 hover:text-red-500 transition-colors uppercase tracking-widest"
          >
            Làm mới tất cả
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="divide-y divide-slate-50">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-200 py-40">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 opacity-20" />
            </div>
            <p className="text-sm font-bold text-slate-300">Chưa có dữ liệu hàng hoá</p>
            <p className="text-xs text-slate-300 mt-1">Vui lòng thêm sản phẩm từ cột bên trái</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onRemove={onRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
