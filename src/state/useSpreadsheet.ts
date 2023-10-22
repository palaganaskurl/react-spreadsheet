import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  CellData,
  CellSelection,
  FormulaCellSelection,
  FormulaEntity,
  Point,
  ScrollData,
} from '../types';
import { generateRandomColor } from '../lib/color';
import { getCellAddressLabel } from '../lib/spreadsheet';
import { getEntityCountByType } from '../lib/formula';
import { focusOnCell } from '../lib/dom';

export interface SpreadsheetState {
  activeCell: [number, number];
  cellRangeEnd: Point | null;
  cellRangeSelection: CellSelection | null;
  cellRangeStart: Point | null;
  columnWidths: Record<number, number>;
  data: CellData[][];
  emptyFormulaCellSelectionPoints: () => void;
  formulaCellSelections: FormulaCellSelection[];
  getCell: (row: number, column: number) => CellData | null;
  getColumnWidth: (columnIndex: number) => number;
  getMatrixValues: () => Array<CellData['value'][]>;
  insertNewColumnAt: (column: number, where: 'before' | 'after') => void;
  insertNewRowAt: (row: number, where: 'before' | 'after') => void;
  isEditingAtFormulaEditor: boolean;
  isSelectingCellsForFormula: boolean;
  scrollData: ScrollData;
  setActiveCell: (row: number, column: number) => void;
  setCellData: (
    row: number,
    column: number,
    updateData: Partial<CellData>
  ) => void;
  setCellRangeEnd: (point: Point | null) => void;
  setCellRangeStart: (point: Point | null) => void;
  setColumnWidth: (columnIndex: number, width: number) => void;
  setData: (data: CellData[][]) => void;
  setFormulaCellSelectionPoints: (
    formulaEntities: CellData['formulaEntities']
  ) => void;
  setFormulaEntitiesFromCellSelection: (
    formulaCellSelectionPoint: Point
  ) => void;
  setIsEditingAtFormulaEditor: (isEditingAtFormulaEditor: boolean) => void;
  setIsSelectingCellsForFormula: (isSelectingCellsForFormula: boolean) => void;
  setScrollData: (scrollData: ScrollData) => void;
  setWriteMethod: (writeMethod: 'overwrite' | 'append') => void;
  writeMethod: 'overwrite' | 'append';
}

export const DEFAULT_COLUMN_WIDTH = 50;
export const DEFAULT_ROW_HEIGHT = 30;
export const COLUMN_COUNT = 26;
export const ROW_COUNT = 500;

const generateInitialColumnWidths = () => {
  const columnWidths: Record<number, number> = {};

  for (let i = 0; i < COLUMN_COUNT; i++) {
    columnWidths[i] = DEFAULT_COLUMN_WIDTH;
  }

  return columnWidths;
};

const generateInitialData = () => {
  const initialRowData: CellData[][] = [];

  for (let i = 0; i < ROW_COUNT; i++) {
    initialRowData.push([]);

    for (let j = 0; j < COLUMN_COUNT; j++) {
      initialRowData[i].push({
        id: uuidv4(),
        value: '',
        formulaEntities: [],
      });
    }
  }

  return initialRowData;
};

const useSpreadsheet = create<SpreadsheetState>()(
  persist(
    (set, get) => ({
      columnWidths: generateInitialColumnWidths(),
      data: generateInitialData(),
      activeCell: [0, 0],
      cellRangeEnd: null,
      cellRangeStart: null,
      cellRangeSelection: null,
      setData: (data: CellData[][]) => {
        set({ data });
      },
      getCell: (row: number, column: number) => {
        const { data } = get();

        if (data[row] && data[row][column]) {
          return data[row][column];
        }

        return null;
      },
      setActiveCell: (row: number, column: number) => {
        set({
          activeCell: [row, column],
        });
        focusOnCell(row, column);
      },
      insertNewRowAt: (row: number, where: 'before' | 'after') => {
        const { data } = get();
        const rowIndex = where === 'before' ? row : row + 1;
        const newUUIDs: CellData[] = [];

        data.splice(rowIndex, 0, newUUIDs);

        set({
          data: [...data],
        });
      },
      insertNewColumnAt: (column: number, where: 'before' | 'after') => {
        const { data } = get();
        const columnIndex = where === 'before' ? column : column + 1;

        for (let i = 0; i < data.length; i++) {
          data[i].splice(columnIndex, 0, {
            id: uuidv4(),
            value: '',
            formulaEntities: [],
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
          cellRangeEnd: point,
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
      setFormulaEntitiesFromCellSelection: (
        formulaCellSelectionPoint: Point
      ) => {
        const { formulaCellSelections, activeCell, data } = get();
        const [activeRow, activeColumn] = activeCell;

        const { operationCount, variableCount } = getEntityCountByType(
          data[activeRow][activeColumn].formulaEntities
        );

        const borderColor = generateRandomColor();
        const [row, column] = formulaCellSelectionPoint;
        const cellAddress = getCellAddressLabel(row, column);

        if (variableCount === 0) {
          const formulaEntity: FormulaEntity = {
            row,
            column,
            address: cellAddress,
            type: 'variable',
            borderColor,
          };

          data[activeRow][activeColumn].value += `${cellAddress}`;
          data[activeRow][activeColumn].formulaEntities.push(formulaEntity);

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
          const formulaEntity: FormulaEntity = {
            row,
            column,
            address: cellAddress,
            type: 'variable',
            borderColor,
          };

          const arrayFromFormulaEntities =
            data[activeRow][activeColumn].formulaEntities;
          const arrayFromFormulaCellSelections = Array.from(
            formulaCellSelections
          );

          arrayFromFormulaCellSelections.pop();
          const poppedEntity = arrayFromFormulaEntities.pop();
          data[activeRow][activeColumn].value = data[activeRow][
            activeColumn
          ].value.replace(poppedEntity?.address || '', '');

          arrayFromFormulaCellSelections.push({
            point: formulaCellSelectionPoint,
            borderColor,
          });
          data[activeRow][activeColumn].formulaEntities =
            arrayFromFormulaEntities;
          data[activeRow][activeColumn].formulaEntities.push(formulaEntity);
          data[activeRow][activeColumn].value += cellAddress;

          set({
            formulaCellSelections: Array.from(arrayFromFormulaCellSelections),
            data: [...data],
          });
        } else {
          const formulaEntity: FormulaEntity = {
            row,
            column,
            address: cellAddress,
            type: 'variable',
            borderColor,
          };

          data[activeRow][activeColumn].value += cellAddress;
          data[activeRow][activeColumn].formulaEntities.push(formulaEntity);
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
      setCellData: (
        row: number,
        column: number,
        updateData: Partial<CellData>
      ) => {
        const { data } = get();

        data[row][column] = {
          ...data[row][column],
          ...updateData,
        };

        if (data[row][column].value.trim() === '') {
          data[row][column].formulaEntities = [];
          data[row][column].result = undefined;
        }

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
      setColumnWidth: (columnIndex: number, width: number) => {
        const { columnWidths } = get();

        columnWidths[columnIndex] = width;

        set({ columnWidths: { ...columnWidths } });
      },
      getColumnWidth: (columnIndex: number) => {
        const { columnWidths } = get();

        return columnWidths[columnIndex];
      },
      scrollData: {
        scrollTop: 0,
        scrollLeft: 0,
      },
      setScrollData: (scrollData: ScrollData) => {
        set({ scrollData });
      },
      writeMethod: 'overwrite',
      setWriteMethod: (writeMethod: 'overwrite' | 'append') => {
        set({
          writeMethod,
        });
      },
    }),
    {
      // skipHydration: true,
      name: 'react-spreadsheet-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) =>
              ![
                'isSelectingCellsForFormula',
                'isEditingAtFormulaEditor',
                'cellRangeEnd',
                'cellRangeSelection',
                'cellRangeStart',
                'formulaCellSelections',
              ].includes(key)
          )
        ),
    }
  )
);

export { useSpreadsheet };
