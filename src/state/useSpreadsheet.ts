import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { CellData, ColumnData, FormulaEntity } from '../types';
import { generateRandomColor } from '../lib/color';
import { getCellAddressLabel } from '../lib/spreadsheet';
import { getOperationCount } from '../lib/formula';

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

export type SpreadsheetState = {
  activeCell: [number, number];
  cellRangeEnd: Point; // TODO: Consider removing this
  cellRangeSelection: CellSelection | null;
  cellRangeStart: Point; // TODO: Consider removing this
  columns: ColumnData[];
  data: Array<CellData[]>;
  formulaCellSelections: Set<FormulaCellSelection>;
  getCellValue: (row: number, column: number) => CellData['value'];
  getMatrixValues: () => Array<CellData['value'][]>;
  insertNewColumnAt: (column: number, where: 'before' | 'after') => void;
  insertNewRowAt: (row: number, where: 'before' | 'after') => void;
  isDraggingCellRange: boolean;
  isSelectingCellsForFormula: boolean;
  setActiveCell: (row: number, column: number) => void;
  setCellRangeEnd: (cellRange: Point | null) => void;
  setCellRangeStart: (cellRange: Point) => void;
  setCellResult: (
    row: number,
    column: number,
    result: CellData['result']
  ) => void;
  setCellValue: (row: number, column: number, value: CellData['value']) => void;
  setColumnWidth: (column: number, width: number) => void;
  setColumns: (columns: ColumnData[]) => void;
  setData: (data: Array<CellData[]>) => void;
  setFormulaCellSelectionPoint: (formulaCellSelectionPoint: Point) => void;
  setIsDraggingCellRange: (isDraggingCellRange: boolean) => void;
  setIsSelectingCellsForFormula: (isSelectingCellsForFormula: boolean) => void;
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
  cellRangeSelection: null,
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
  setCellResult: (row: number, column: number, result: CellData['result']) => {
    const { data } = get();

    data[row][column].result = result;

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
        value: '',
        formulaEntities: new Set<FormulaEntity>(),
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
        value: '',
        formulaEntities: new Set(),
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
  setCellRangeEnd: (point: Point | null) => {
    if (point === null) {
      set({ cellRangeSelection: null });

      return;
    }

    const { cellRangeStart } = get();

    const [startRow, startCol] = cellRangeStart;
    const [endRow, endCol] = point;

    const startCellCol = Math.min(startCol, endCol);
    const startCellRow = Math.min(startRow, endRow);

    const endCellCol = Math.max(startCol, endCol);
    const endCellRow = Math.max(startRow, endRow);

    if (
      startCellCol < 0 ||
      startCellRow < 0 ||
      endCellRow < 0 ||
      endCellCol < 0
    ) {
      set({ cellRangeSelection: null });
    }

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

    set({
      cellRangeSelection: {
        width,
        top: startBoundingClientRect?.y || 0,
        left: startBoundingClientRect?.x || 0,
        height,
      },
    });
  },
  setIsDraggingCellRange: (isDraggingCellRange: boolean) => {
    set({
      isDraggingCellRange,
    });
  },
  getMatrixValues: () => {
    const { data } = get();

    return data.map((row) => {
      const rowCopy = row.map((cell) => cell?.value);

      return rowCopy;
    });
  },
  isSelectingCellsForFormula: false,
  setIsSelectingCellsForFormula: (isSelectingCellsForFormula: boolean) => {
    set({ isSelectingCellsForFormula });
  },
  formulaCellSelections: new Set(),
  setFormulaCellSelectionPoint: (formulaCellSelectionPoint: Point) => {
    const { formulaCellSelections, activeCell, data } = get();
    const [activeRow, activeColumn] = activeCell;

    const operationCount = getOperationCount(
      data[activeRow][activeColumn].value
    );

    if (data[activeRow][activeColumn].formulaEntities.size === 0) {
      const [row, column] = formulaCellSelectionPoint;
      const cellAddress = getCellAddressLabel(row, column);
      const formulaEntity: FormulaEntity = {
        row,
        column,
        address: cellAddress,
      };

      data[activeRow][activeColumn].value = `=${cellAddress}`;
      data[activeRow][activeColumn].formulaEntities.add(formulaEntity);

      let inFormulaCellSelections = formulaCellSelections;

      if (!formulaCellSelections) {
        inFormulaCellSelections = new Set([
          {
            point: formulaCellSelectionPoint,
            borderColor: generateRandomColor(),
          },
        ]);
      } else {
        inFormulaCellSelections.add({
          point: formulaCellSelectionPoint,
          borderColor: generateRandomColor(),
        });
      }

      set({
        formulaCellSelections: new Set(inFormulaCellSelections),
        data: [...data],
      });

      return;
    }

    if (
      operationCount ===
      data[activeRow][activeColumn].formulaEntities.size - 1
    ) {
      const [row, column] = formulaCellSelectionPoint;
      const cellAddress = getCellAddressLabel(row, column);
      const formulaEntity: FormulaEntity = {
        row,
        column,
        address: cellAddress,
      };

      const arrayFromFormulaEntities = Array.from(
        data[activeRow][activeColumn].formulaEntities
      );
      const arrayFromFormulaCellSelections = Array.from(formulaCellSelections);

      arrayFromFormulaCellSelections.pop();
      const poppedEntity = arrayFromFormulaEntities.pop();
      data[activeRow][activeColumn].value = data[activeRow][
        activeColumn
      ].value.replace(poppedEntity?.address || '', '');

      const newFormulaCellSelectionsSet = new Set(
        arrayFromFormulaCellSelections
      );

      newFormulaCellSelectionsSet.add({
        point: formulaCellSelectionPoint,
        borderColor: generateRandomColor(),
      });
      data[activeRow][activeColumn].formulaEntities = new Set(
        arrayFromFormulaEntities
      );
      data[activeRow][activeColumn].formulaEntities.add(formulaEntity);
      data[activeRow][activeColumn].value += cellAddress;

      set({
        formulaCellSelections: newFormulaCellSelectionsSet,
        data: [...data],
      });
    } else {
      const [row, column] = formulaCellSelectionPoint;
      const cellAddress = getCellAddressLabel(row, column);
      const formulaEntity: FormulaEntity = {
        row,
        column,
        address: cellAddress,
      };

      data[activeRow][activeColumn].value += cellAddress;
      data[activeRow][activeColumn].formulaEntities.add(formulaEntity);
      formulaCellSelections.add({
        point: formulaCellSelectionPoint,
        borderColor: generateRandomColor(),
      });

      set({
        formulaCellSelections: new Set(formulaCellSelections),
        data: [...data],
      });
    }
  },
}));

export { useSpreadsheet };
