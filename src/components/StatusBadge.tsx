import React from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { ProductStatus } from '../types';

interface StatusBadgeProps {
  status: ProductStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 'processing':
      return <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return null;
  }
};
