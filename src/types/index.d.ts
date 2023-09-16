import React from 'react';

export type CellValue = number | string;

export type HeaderData = {
  height: number;
  index: number;
  label: string;
  width: number;
};

export type CellData = {
  height: number;
  id: string;
  value?: CellValue;
  width: number;
};

export interface CellProps {
  column: number;
  height: number;
  id: string;
  row: number;
  value?: CellValue;
  width: number;
}

export interface RowProps {
  children: React.ReactNode;
  index: number;
}

export interface RowContextMenuProps {
  rowIndex: number;
}
