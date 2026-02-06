import React, { useState, useEffect } from 'react';
import { ShoppingBag, Download, Sparkles, Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import { useProducts } from './hooks/useProducts';
import { useProductProcessing } from './hooks/useProductProcessing';
import { ProductInput } from './components/ProductInput';
import { ProductList } from './components/ProductList';
import { ToastContainer } from './components/Toast';
import { ConfirmDialog } from './components/ConfirmDialog';
import { useToast } from './hooks/useToast';
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
    error: productsError,
    loadProducts,
  } = useProducts();

  const { isLoading, error, processProducts, clearError } = useProductProcessing();
  const toast = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (productsError) {
      toast.error(productsError);
    }
  }, [productsError, toast]);

  const handleProcessProducts = async () => {
    try {
      await processProducts(products, setProducts);
      toast.success('Đã bắt đầu xử lý sản phẩm');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi xử lý sản phẩm');
    }
  };

  const handleClearAll = async () => {
    setShowConfirmDialog(true);
  };

  const confirmClearAll = async () => {
    setShowConfirmDialog(false);
    try {
      await clearAll();
      clearError();
      toast.success('Đã xóa toàn bộ danh sách');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa sản phẩm';
      toast.error(errorMessage);
    }
  };

  const handleAddProducts = async (names: string[]) => {
    await addProducts(names);
  };

  const handleRemoveProduct = async (id: string) => {
    try {
      await removeProduct(id);
      toast.success('Đã xóa sản phẩm');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa sản phẩm';
      toast.error(errorMessage);
      throw err;
    }
  };

  const handleExport = () => {
    const exportData = products
      .filter(p => p.status === 'completed')
      .map(p => ({ name: p.name, description: p.description }));

    if (exportData.length === 0) {
      toast.warning('Chưa có kết quả để xuất');
      return;
    }

    try {
      exportToExcel(exportData);
      toast.success(`Đã xuất ${exportData.length} sản phẩm ra file Excel`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi xuất file Excel');
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
          <ProductInput 
            onAddProducts={handleAddProducts} 
            isLoading={isLoading || isLoadingProducts}
            onError={(err) => toast.error(err)}
            onSuccess={(count) => toast.success(`Đã thêm ${count} sản phẩm`)}
          />

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
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 text-red-700 text-xs font-medium transition-all duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1">
                <p>{error}</p>
                <button
                  onClick={() => {
                    clearError();
                    handleProcessProducts();
                  }}
                  className="mt-2 text-xs font-bold text-red-600 hover:text-red-800 underline"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {productsError && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1">
                <p>{productsError}</p>
                <button
                  onClick={loadProducts}
                  className="mt-2 text-xs font-bold text-red-600 hover:text-red-800 underline"
                >
                  Tải lại
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8">
          <ProductList
            products={products}
            completedCount={completedCount}
            isLoading={isLoadingProducts}
            onRemove={handleRemoveProduct}
            onClearAll={handleClearAll}
          />
        </div>
      </main>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa toàn bộ danh sách sản phẩm? Hành động này không thể hoàn tác."
        confirmText="Xóa tất cả"
        cancelText="Hủy"
        type="danger"
        onConfirm={confirmClearAll}
        onCancel={() => setShowConfirmDialog(false)}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes zoomIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
