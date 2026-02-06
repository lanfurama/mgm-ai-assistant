import React from 'react';
import { ShoppingBag, Download, Sparkles, Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import { useProducts } from './hooks/useProducts';
import { useProductProcessing } from './hooks/useProductProcessing';
import { ProductInput } from './components/ProductInput';
import { ProductList } from './components/ProductList';
import { exportToExcel } from './utils/excelUtils';

const App: React.FC = () => {
  const {
    products,
    setProducts,
    addProducts,
    removeProduct,
    clearAll,
    completedCount,
    hasPending,
    isLoading: isLoadingProducts,
  } = useProducts();

  const { isLoading, error, processProducts, clearError } = useProductProcessing();

  const handleProcessProducts = async () => {
    await processProducts(products, setProducts);
  };

  const handleClearAll = async () => {
    if (window.confirm("Xóa toàn bộ danh sách?")) {
      try {
        await clearAll();
        clearError();
      } catch (err) {
        console.error('Error clearing all products:', err);
      }
    }
  };

  const handleExport = () => {
    const exportData = products
      .filter(p => p.status === 'completed')
      .map(p => ({ name: p.name, description: p.description }));

    if (exportData.length === 0) {
      alert("Chưa có kết quả để xuất.");
      return;
    }

    try {
      exportToExcel(exportData);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi xuất file Excel");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
              <ShoppingBag className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">MGM AI Assistant</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={completedCount === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                completedCount > 0
                  ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel ({completedCount})</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <ProductInput onAddProducts={addProducts} isLoading={isLoading || isLoadingProducts} />

          <section className="bg-slate-900 p-7 rounded-3xl text-white shadow-2xl shadow-slate-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-20 h-20" />
            </div>
            <h2 className="font-black text-lg flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              AI SEO Writer
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Tạo bài viết chuẩn SEO (200-300 từ) chuyên nghiệp, tối ưu hóa từ khóa và nội dung bán hàng.
            </p>
            <button
              onClick={handleProcessProducts}
              disabled={isLoading || !hasPending}
              className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-lg ${
                isLoading || !hasPending
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-emerald-500/20 active:scale-[0.97]'
              }`}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
              {isLoading ? "ĐANG VIẾT BÀI..." : "BẮT ĐẦU XỬ LÝ"}
            </button>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 text-red-700 text-xs font-medium animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-8">
          <ProductList
            products={products}
            completedCount={completedCount}
            onRemove={removeProduct}
            onClearAll={handleClearAll}
          />
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default App;
