import React from 'react';

export type ColumnData = {
  height: number;
  id: string;
  width: number;
};

export type FormulaEntity = {
  address?: string;
  borderColor?: string;
  column?: number;
  operation?: string;
  row?: number;
  type: 'variable' | 'operation';
};

export type CellData = {
  formulaEntities: FormulaEntity[];
  id: string;
  result?: number;
  value: string;
};

export interface CellProps extends CellData {
  column: number;
  row: number;
  style: React.CSSProperties;
}

export interface RowProps {
  rowIndex: number;
  style: React.CSSProperties;
}

export interface RowContextMenuProps {
  rowIndex: number;
}

export interface ColumnProps {
  columnIndex: number;
  style: React.CSSProperties;
}

export interface ColumnContextMenuProps {
  columnIndex: number;
}

export interface SelectionOverlayStyle {
  borderColor: string;
  height: number;
  left: number;
  top: number;
  width: number;
}

export type Point = [number, number];

export interface CellSelection {
  height: number;
  left: number;
  top: number;
  width: number;
}

export interface FormulaCellSelection {
  borderColor: string;
  point: Point;
}

export interface ScrollData {
  scrollLeft: number;
  scrollTop: number;
}
