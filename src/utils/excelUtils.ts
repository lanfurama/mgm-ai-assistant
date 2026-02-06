import * as XLSX from 'xlsx';
import { validateProductNames, isValidExcelFile, validateFileSize } from './validation';

export const parseExcelFile = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    if (!isValidExcelFile(file)) {
      reject(new Error('File không hợp lệ. Chỉ chấp nhận file Excel (.xlsx, .xls)'));
      return;
    }

    if (!validateFileSize(file, 10)) {
      reject(new Error('File quá lớn. Kích thước tối đa là 10MB'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (workbook.SheetNames.length === 0) {
          reject(new Error('File Excel không có sheet nào'));
          return;
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        const names = jsonData
          .map(row => row[0])
          .filter(name => typeof name === 'string' && name.trim() !== '');
        
        const validNames = validateProductNames(names);
        
        if (validNames.length === 0) {
          reject(new Error('Không tìm thấy tên sản phẩm hợp lệ trong file'));
          return;
        }

        resolve(validNames);
      } catch (error) {
        reject(new Error(`Lỗi khi đọc file Excel: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Lỗi khi đọc file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (
  data: { name: string; description: string }[], 
  fileName: string = 'ket-qua-san-pham.xlsx'
): void => {
  if (!data || data.length === 0) {
    throw new Error('Không có dữ liệu để xuất');
  }

  try {
    const worksheet = XLSX.utils.json_to_sheet(data, { header: ['name', 'description'] });
    
    XLSX.utils.sheet_add_aoa(worksheet, [["Tên Sản Phẩm", "Mô Tả Sản Phẩm"]], { origin: "A1" });
    
    worksheet['!cols'] = [{ wch: 30 }, { wch: 80 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản phẩm');
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    throw new Error(`Lỗi khi xuất file Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
