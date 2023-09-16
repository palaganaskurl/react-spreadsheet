import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { CellData, ColumnData } from '../types';

export type SpreadsheetState = {
  activeCell: [number, number];
  columns: ColumnData[];
  data: Array<CellData[]>;
  getCellValue: (row: number, column: number) => CellData['value'];
  insertNewColumnAt: (column: number, where: 'before' | 'after') => void;
  insertNewRowAt: (row: number, where: 'before' | 'after') => void;
  setActiveCell: (row: number, column: number) => void;
  setCellValue: (row: number, column: number, value: CellData['value']) => void;
  setColumnWidth: (column: number, width: number) => void;
  setColumns: (columns: ColumnData[]) => void;
  setData: (data: Array<CellData[]>) => void;
};

const DEFAULT_COLUMN_WIDTH = 50;
const DEFAULT_ROW_HEIGHT = 30;
const COLUMN_COUNT = 10;

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
  setData: (data: Array<CellData[]>) => {
    set({ data });
  },
  getCellValue: (row: number, column: number) => {
    const { data } = get();

    return data[row][column].value;
  },
  setCellValue: (row: number, column: number, value: CellData['value']) => {
    const { data } = get();

    if (value !== undefined) {
      data[row][column].value = value;
    }

    set({
      data,
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
}));

export { useSpreadsheet };
