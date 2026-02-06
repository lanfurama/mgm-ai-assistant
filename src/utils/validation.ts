export const validateProductName = (name: string): boolean => {
  return typeof name === 'string' && name.trim().length > 0;
};

export const validateProductNames = (names: string[]): string[] => {
  return names.filter(name => validateProductName(name)).map(name => name.trim());
};

export const isValidExcelFile = (file: File): boolean => {
  const validExtensions = ['.xlsx', '.xls'];
  const fileName = file.name.toLowerCase();
  return validExtensions.some(ext => fileName.endsWith(ext));
};

export const validateFileSize = (file: File, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};
