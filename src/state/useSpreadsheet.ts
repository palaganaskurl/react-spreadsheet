import { create } from 'zustand';
import { CellData, HeaderData } from '../types';
import { numberToExcelHeaderArray } from '../lib/spreadsheet';

export type SpreadsheetState = {
  activeCell: [CellData['column'], CellData['column']];
  data: Array<CellData[]>;
  getCellValue: (
    row: CellData['row'],
    column: CellData['column']
  ) => CellData['value'];
  headers: HeaderData[];
  setActiveCell: (row: CellData['row'], column: CellData['column']) => void;
  setCellValue: (
    row: CellData['row'],
    column: CellData['column'],
    value: CellData['value']
  ) => void;
  setColumnWidth: (column: number, width: number) => void;
  setHeaders: (headers: HeaderData[]) => void;
  setInitialData: (initialData: Array<CellData[]>) => void;
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
  setInitialData: (initialData: Array<CellData[]>) => {
    set({
      data: initialData,
    });
  },
  getCellValue: (row: CellData['row'], column: CellData['column']) => {
    const { data } = get();

    return data[row][column].value;
  },
  setCellValue: (
    row: CellData['row'],
    column: CellData['column'],
    value: CellData['value']
  ) => {
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
      const rowCopy = row.map((cell) => {
        if (cell.column === column) {
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
  setActiveCell: (row: CellData['row'], column: CellData['column']) => {
    set({
      activeCell: [row, column],
    });
  },
  setHeaders: (headers: HeaderData[]) => {
    set({
      headers,
    });
  },
}));

export { useSpreadsheet };
