import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { CellData, HeaderData } from '../types';
import { numberToExcelHeaderArray } from '../lib/spreadsheet';

export type SpreadsheetState = {
  activeCell: [number, number];
  data: Array<CellData[]>;
  getCellValue: (row: number, column: number) => CellData['value'];
  headers: HeaderData[];
  insertNewRowAt: (row: number, where: 'before' | 'after') => void;
  setActiveCell: (row: number, column: number) => void;
  setCellValue: (row: number, column: number, value: CellData['value']) => void;
  setColumnWidth: (column: number, width: number) => void;
  setData: (data: Array<CellData[]>) => void;
  setHeaders: (headers: HeaderData[]) => void;
};

const DEFAULT_COLUMN_WIDTH = 50;
const DEFAULT_ROW_HEIGHT = 30;
const COLUMN_COUNT = 10;
const defaultColumnHeaders = numberToExcelHeaderArray(COLUMN_COUNT);

const useSpreadsheet = create<SpreadsheetState>((set, get) => ({
  data: [],
  headers: defaultColumnHeaders.map((header, index) => ({
    height: DEFAULT_ROW_HEIGHT,
    width: DEFAULT_COLUMN_WIDTH,
    index,
    label: header,
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
  setHeaders: (headers: HeaderData[]) => {
    set({
      headers,
    });
  },
  insertNewRowAt: (row: number, where: 'before' | 'after') => {
    const { data, headers } = get();
    const rowIndex = where === 'before' ? row : row + 1;
    const newUUIDs = [];

    console.log('data before', data);

    for (let i = 0; i < headers.length; i++) {
      newUUIDs.push({
        height: 30,
        width: 50,
        id: uuidv4(),
      });
    }

    data.splice(rowIndex, 0, newUUIDs);

    console.log('data after', data);

    set({
      data: [...data],
    });
  },
}));

export { useSpreadsheet };
