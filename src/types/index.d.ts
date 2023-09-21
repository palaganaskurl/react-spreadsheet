import React from 'react';

export type ColumnData = {
  height: number;
  id: string;
  width: number;
};

export type CellData = {
  height: number;
  id: string;
  result?: number;
  value: string;
  width: number;
};

export interface CellProps extends CellData {
  column: number;
  row: number;
}

export interface RowProps {
  children: React.ReactNode;
  index: number;
}

export interface RowContextMenuProps {
  rowIndex: number;
}

export interface ColumnProps {
  columnData: ColumnData;
  columnIndex: number;
}

export interface ColumnContextMenuProps {
  columnIndex: number;
}

export interface SelectionOverlayStyle {
  height: number;
  left: number;
  top: number;
  width: number;
}
