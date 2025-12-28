import React from 'react';
import { TableVariant } from '../../types/components';

interface TableProps {
  headers: string[];
  rows: React.ReactNode[][];
  variant?: TableVariant;
  className?: string;
}

export const Table: React.FC<TableProps> = ({
  headers,
  rows,
  variant = TableVariant.DEFAULT,
  className = '',
}) => {
  const variantClasses = {
    [TableVariant.DEFAULT]: '',
    [TableVariant.STRIPED]: '[&>tbody>tr:nth-child(even)]:bg-surface-tertiary',
    [TableVariant.BORDERED]: 'border border-border-primary',
  };

  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse ${variantClasses[variant]} ${className}`}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="text-left text-text-tertiary text-sm font-semibold px-3 py-2 border-b border-border-secondary"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="text-text-secondary text-sm px-3 py-2 border-b border-border-secondary align-middle"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
