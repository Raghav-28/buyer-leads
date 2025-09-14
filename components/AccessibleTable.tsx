'use client';

import React from 'react';

interface AccessibleTableProps {
  children: React.ReactNode;
  caption?: string;
  style?: React.CSSProperties;
}

export default function AccessibleTable({ children, caption, style }: AccessibleTableProps) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        role="table"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "white",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          ...style
        }}
      >
        {caption && (
          <caption style={{
            padding: "16px",
            fontSize: "18px",
            fontWeight: "600",
            textAlign: "left",
            backgroundColor: "#f8f9fa",
            borderBottom: "1px solid #dee2e6"
          }}>
            {caption}
          </caption>
        )}
        {children}
      </table>
    </div>
  );
}

interface AccessibleTableHeaderProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function AccessibleTableHeader({ children, style }: AccessibleTableHeaderProps) {
  return (
    <thead style={{ backgroundColor: "#f8f9fa" }}>
      <tr style={style}>
        {children}
      </tr>
    </thead>
  );
}

interface AccessibleTableHeaderCellProps {
  children: React.ReactNode;
  scope?: 'col' | 'row';
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
  style?: React.CSSProperties;
}

export function AccessibleTableHeaderCell({ 
  children, 
  scope = 'col', 
  sortable = false, 
  sortDirection, 
  onSort,
  style 
}: AccessibleTableHeaderCellProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (sortable && onSort && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onSort();
    }
  };

  return (
    <th
      scope={scope}
      tabIndex={sortable ? 0 : undefined}
      role={sortable ? "button" : undefined}
      onClick={sortable ? onSort : undefined}
      onKeyDown={handleKeyDown}
      aria-sort={sortable ? (sortDirection || 'none') : undefined}
      style={{
        padding: "16px 12px",
        textAlign: "left",
        fontWeight: "600",
        fontSize: "14px",
        color: "#495057",
        borderBottom: "2px solid #dee2e6",
        cursor: sortable ? "pointer" : "default",
        outline: "none",
        ...style
      }}
    >
      {children}
      {sortable && (
        <span style={{ marginLeft: "8px", fontSize: "12px" }}>
          {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}
        </span>
      )}
    </th>
  );
}

interface AccessibleTableBodyProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function AccessibleTableBody({ children, style }: AccessibleTableBodyProps) {
  return (
    <tbody style={style}>
      {children}
    </tbody>
  );
}

interface AccessibleTableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function AccessibleTableRow({ children, onClick, style }: AccessibleTableRowProps) {
  return (
    <tr
      role={onClick ? "button" : "row"}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        borderBottom: "1px solid #dee2e6",
        cursor: onClick ? "pointer" : "default",
        outline: "none",
        ...style
      }}
    >
      {children}
    </tr>
  );
}

interface AccessibleTableCellProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function AccessibleTableCell({ children, style }: AccessibleTableCellProps) {
  return (
    <td
      style={{
        padding: "12px",
        fontSize: "13px",
        ...style
      }}
    >
      {children}
    </td>
  );
}