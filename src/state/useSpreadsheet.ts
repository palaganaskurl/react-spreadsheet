import { create } from 'zustand';
import { CellData } from '../types';

export type SpreadsheetState = {
  activeCell: [number, number];
  data: Array<CellData[]>;
  getCellValue: (
    row: CellData['row'],
    column: CellData['column']
  ) => CellData['value'];
  setActiveCell: (row: CellData['row'], column: CellData['column']) => void;
  setCellValue: (
    row: CellData['row'],
    column: CellData['column'],
    value: CellData['value']
  ) => void;
  setColumnWidth: (column: number, width: number) => void;
  setInitialData: (initialData: Array<CellData[]>) => void;
};

const useSpreadsheet = create<SpreadsheetState>((set, get) => ({
  data: [],
  activeCell: [-1, -1],
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
}));

export { useSpreadsheet };
