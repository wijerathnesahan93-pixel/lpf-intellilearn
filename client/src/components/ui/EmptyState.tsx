import React from 'react';
import { InboxIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-gray-300 mb-4">
        {icon || <InboxIcon className="w-12 h-12" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {description && <p className="text-gray-500 mt-1 text-center max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
