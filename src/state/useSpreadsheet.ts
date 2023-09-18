import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { CellData, ColumnData } from '../types';

export type Point = [number, number];

export interface CellSelection {
  height: number;
  left: number;
  top: number;
  width: number;
}

export type SpreadsheetState = {
  activeCell: [number, number];
  cellRangeEnd: Point; // TODO: Consider removing this
  cellRangeSelection: CellSelection;
  cellRangeStart: Point; // TODO: Consider removing this
  columns: ColumnData[];
  data: Array<CellData[]>;
  getCellValue: (row: number, column: number) => CellData['value'];
  insertNewColumnAt: (column: number, where: 'before' | 'after') => void;
  insertNewRowAt: (row: number, where: 'before' | 'after') => void;
  isDraggingCellRange: boolean;
  setActiveCell: (row: number, column: number) => void;
  setCellRangeEnd: (cellRange: Point) => void;
  setCellRangeStart: (cellRange: Point) => void;
  setCellValue: (row: number, column: number, value: CellData['value']) => void;
  setColumnWidth: (column: number, width: number) => void;
  setColumns: (columns: ColumnData[]) => void;
  setData: (data: Array<CellData[]>) => void;
  setIsDraggingCellRange: (isDraggingCellRange: boolean) => void;
};

const DEFAULT_COLUMN_WIDTH = 50;
const DEFAULT_ROW_HEIGHT = 30;
const COLUMN_COUNT = 20;

const useSpreadsheet = create<SpreadsheetState>((set, get) => ({
  data: [],
  columns: Array(COLUMN_COUNT)
    .fill({})
    .map(() => ({
      height: DEFAULT_ROW_HEIGHT,
      width: DEFAULT_COLUMN_WIDTH,
      id: uuidv4(),
    })),
  activeCell: [0, 0],
  cellRangeEnd: [-1, -1],
  cellRangeStart: [-1, -1],
  isDraggingCellRange: false,
  cellRangeSelection: {
    top: 0,
    left: 0,
    height: 0,
    width: 0,
  },
  setData: (data: Array<CellData[]>) => {
    set({ data });
  },
  getCellValue: (row: number, column: number) => {
    const { data } = get();

    if (data[row] && data[row][column]) {
      return data[row][column]?.value;
    }

    return '';
  },
  setCellValue: (row: number, column: number, value: CellData['value']) => {
    const { data } = get();

    if (value !== undefined) {
      data[row][column].value = value;
    }

    set({
      data: [...data],
    });
  },
  setColumnWidth: (column: number, width: number) => {
    const { data } = get();

    const updatedRowHeight = data.map((row) => {
      const rowCopy = row.map((cell, columnIndex) => {
        if (columnIndex === column) {
          return {
            ...cell,
            ...{ width },
          };
        }

        return cell;
      });

      return rowCopy;
    });

    set({
      data: updatedRowHeight,
    });
  },
  setActiveCell: (row: number, column: number) => {
    set({
      activeCell: [row, column],
    });
  },
  setColumns: (columns: ColumnData[]) => {
    set({
      columns,
    });
  },
  insertNewRowAt: (row: number, where: 'before' | 'after') => {
    const { data, columns } = get();
    const rowIndex = where === 'before' ? row : row + 1;
    const newUUIDs = [];

    for (let i = 0; i < columns.length; i++) {
      newUUIDs.push({
        height: columns[i].height,
        width: columns[i].width,
        id: uuidv4(),
        selected: false,
      });
    }

    data.splice(rowIndex, 0, newUUIDs);

    set({
      data: [...data],
    });
  },
  insertNewColumnAt: (column: number, where: 'before' | 'after') => {
    const { data, columns } = get();
    const columnIndex = where === 'before' ? column : column + 1;

    columns.splice(columnIndex, 0, {
      height: DEFAULT_ROW_HEIGHT,
      width: DEFAULT_COLUMN_WIDTH,
      id: uuidv4(),
    });

    for (let i = 0; i < data.length; i++) {
      data[i].splice(columnIndex, 0, {
        height: DEFAULT_ROW_HEIGHT,
        width: DEFAULT_COLUMN_WIDTH,
        id: uuidv4(),
      });
    }

    set({
      data: [...data],
    });
  },
  setCellRangeStart: (point: Point) => {
    set({
      cellRangeStart: point,
    });
  },
  setCellRangeEnd: (point: Point) => {
    const { cellRangeStart } = get();

    const [startRow, startCol] = cellRangeStart;
    const [endRow, endCol] = point;

    const startCellCol = Math.min(startCol, endCol);
    const startCellRow = Math.min(startRow, endRow);

    const endCellCol = Math.max(startCol, endCol);
    const endCellRow = Math.max(startRow, endRow);

    const startBoundingClientRect = document
      .querySelector(
        `[data-row="${startCellRow}"][data-column="${startCellCol}"]`
      )
      ?.getBoundingClientRect();

    let width = 0;
    let height = 0;

    for (let i = startCellCol; i <= endCellCol; i++) {
      const boundingClientRect = document
        .querySelector(`[data-column="${i}"]`)
        ?.getBoundingClientRect();
      width += boundingClientRect?.width || 0;
    }

    for (let i = startCellRow; i <= endCellRow; i++) {
      const boundingClientRect = document
        .querySelector(`[data-row="${i}"]`)
        ?.getBoundingClientRect();
      height += boundingClientRect?.height || 0;
    }

    // Subtract 1px to width and height to make the selection border more visible.
    --width;
    --height;

    set({
      cellRangeEnd: point,
      cellRangeSelection: {
        width,
        top: startBoundingClientRect!.y,
        left: startBoundingClientRect!.x,
        height,
      },
    });
  },
  setIsDraggingCellRange: (isDraggingCellRange: boolean) => {
    set({
      isDraggingCellRange,
    });
  },
}));

export { useSpreadsheet };
