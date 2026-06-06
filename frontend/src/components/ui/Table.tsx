import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className = '', ...props }) => (
  <div className="w-full overflow-auto rounded-card border border-border-main bg-white">
    <table className={`w-full border-collapse text-left ${className}`} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', ...props }) => (
  <thead className={`bg-surface-container-low border-b border-border-main ${className}`} {...props} />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', ...props }) => (
  <tbody className={`divide-y divide-border-soft ${className}`} {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className = '', ...props }) => (
  <tr
    className={`hover:bg-[#F2F7F4] transition-colors duration-200 ${className}`}
    {...props}
  />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className = '', ...props }) => (
  <th
    className={`px-comfortable py-3 font-semibold text-label-md text-text-secondary uppercase tracking-wider ${className}`}
    {...props}
  />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className = '', ...props }) => (
  <td className={`px-comfortable py-4 text-body-sm text-text-primary ${className}`} {...props} />
);
