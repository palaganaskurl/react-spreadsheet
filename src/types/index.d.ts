import React from 'react';

export type CellValue = number | string;

export type ColumnData = {
  height: number;
  id: string;
  width: number;
};

export type CellData = {
  height: number;
  id: string;
  selected: boolean;
  value?: CellValue;
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
