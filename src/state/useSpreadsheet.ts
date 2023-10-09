import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  CellData,
  CellSelection,
  ColumnData,
  FormulaCellSelection,
  FormulaEntity,
  Point,
} from '../types';
import { generateRandomColor } from '../lib/color';
import { getCellAddressLabel } from '../lib/spreadsheet';
import { getEntityCountByType } from '../lib/formula';
import { focusOnCell } from '../lib/dom';

export type SpreadsheetState = {
  activeCell: [number, number];
  cellRangeEnd: Point | null;
  cellRangeSelection: CellSelection | null;
  cellRangeStart: Point | null;
  columns: ColumnData[];
  data: Array<CellData[]>;
  emptyFormulaCellSelectionPoints: () => void;
  formulaCellSelections: FormulaCellSelection[];
  getCell: (row: number, column: number) => CellData | null;
  getMatrixValues: () => Array<CellData['value'][]>;
  insertNewColumnAt: (column: number, where: 'before' | 'after') => void;
  insertNewRowAt: (row: number, where: 'before' | 'after') => void;
  isEditingAtFormulaEditor: boolean;
  isSelectingCellsForFormula: boolean;
  setActiveCell: (row: number, column: number) => void;
  setCellData: (
    row: number,
    column: number,
    updateData: Partial<CellData>
  ) => void;
  setCellRangeEnd: (cellRange: Point | null) => void;
  setCellRangeStart: (cellRange: Point) => void;
  setColumnWidth: (column: number, width: number) => void;
  setColumns: (columns: ColumnData[]) => void;
  setData: (data: Array<CellData[]>) => void;
  setFormulaCellSelectionPoints: (
    formulaEntities: CellData['formulaEntities']
  ) => void;
  setFormulaEntitiesFromCellSelection: (
    formulaCellSelectionPoint: Point
  ) => void;
  setIsEditingAtFormulaEditor: (isEditingAtFormulaEditor: boolean) => void;
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
  cellRangeEnd: null,
  cellRangeStart: null,
  cellRangeSelection: null,
  setData: (data: Array<CellData[]>) => {
    set({ data });
  },
  getCell: (row: number, column: number) => {
    const { data } = get();

    if (data[row] && data[row][column]) {
      return data[row][column];
    }

    return null;
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
    focusOnCell(row, column);
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
  setCellRangeStart: (point: Point | null) => {
    set({
      cellRangeStart: point,
    });
  },
  setCellRangeEnd: (point: Point | null) => {
    if (point === null) {
      set({
        cellRangeSelection: null,
        cellRangeStart: null,
        cellRangeEnd: null,
      });

      return;
    }

    const { cellRangeStart } = get();

    if (cellRangeStart === null) {
      return;
    }

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

    set({
      cellRangeSelection: {
        width,
        top: (startBoundingClientRect?.y || 0) + window.scrollY,
        left: (startBoundingClientRect?.x || 0) + window.scrollX,
        height,
      },
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
  formulaCellSelections: [],
  emptyFormulaCellSelectionPoints: () => {
    set({
      formulaCellSelections: [],
    });
  },
  setFormulaEntitiesFromCellSelection: (formulaCellSelectionPoint: Point) => {
    const { formulaCellSelections, activeCell, data } = get();
    const [activeRow, activeColumn] = activeCell;

    const { operationCount, variableCount } = getEntityCountByType(
      data[activeRow][activeColumn].formulaEntities
    );

    const borderColor = generateRandomColor();

    if (variableCount === 0) {
      const [row, column] = formulaCellSelectionPoint;
      const cellAddress = getCellAddressLabel(row, column);

      const formulaEntity: FormulaEntity = {
        row,
        column,
        address: cellAddress,
        type: 'variable',
        borderColor,
      };

      data[activeRow][activeColumn].value = `=${cellAddress}`;
      data[activeRow][activeColumn].formulaEntities.add(formulaEntity);

      const inFormulaCellSelections: FormulaCellSelection[] = [
        {
          point: formulaCellSelectionPoint,
          borderColor,
        },
      ];

      set({
        formulaCellSelections: Array.from(inFormulaCellSelections),
        data: [...data],
      });

      return;
    }

    if (operationCount === variableCount - 1) {
      const [row, column] = formulaCellSelectionPoint;
      const cellAddress = getCellAddressLabel(row, column);
      const formulaEntity: FormulaEntity = {
        row,
        column,
        address: cellAddress,
        type: 'variable',
        borderColor,
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

      arrayFromFormulaCellSelections.push({
        point: formulaCellSelectionPoint,
        borderColor,
      });
      data[activeRow][activeColumn].formulaEntities = new Set(
        arrayFromFormulaEntities
      );
      data[activeRow][activeColumn].formulaEntities.add(formulaEntity);
      data[activeRow][activeColumn].value += cellAddress;

      set({
        formulaCellSelections: Array.from(arrayFromFormulaCellSelections),
        data: [...data],
      });
    } else {
      const [row, column] = formulaCellSelectionPoint;
      const cellAddress = getCellAddressLabel(row, column);
      const formulaEntity: FormulaEntity = {
        row,
        column,
        address: cellAddress,
        type: 'variable',
        borderColor,
      };

      data[activeRow][activeColumn].value += cellAddress;
      data[activeRow][activeColumn].formulaEntities.add(formulaEntity);
      formulaCellSelections.push({
        point: formulaCellSelectionPoint,
        borderColor,
      });

      set({
        formulaCellSelections: Array.from(formulaCellSelections),
        data: [...data],
      });
    }
  },
  setCellData: (row: number, column: number, updateData: Partial<CellData>) => {
    const { data } = get();

    data[row][column] = {
      ...data[row][column],
      ...updateData,
    };

    set({ data: [...data] });
  },
  setFormulaCellSelectionPoints: (
    formulaEntities: CellData['formulaEntities']
  ) => {
    const formulaCellSelections = new Set<FormulaCellSelection>();

    formulaEntities.forEach((entity) => {
      if (
        entity.borderColor !== undefined &&
        entity.row !== undefined &&
        entity.column !== undefined
      ) {
        formulaCellSelections.add({
          borderColor: entity.borderColor,
          point: [entity.row, entity.column],
        });
      }
    });

    set({
      formulaCellSelections: Array.from(formulaCellSelections),
    });
  },
  isEditingAtFormulaEditor: false,
  setIsEditingAtFormulaEditor: (isEditingAtFormulaEditor: boolean) => {
    set({
      isEditingAtFormulaEditor,
    });
  },
}));

export { useSpreadsheet };
