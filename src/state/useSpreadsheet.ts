import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Stage } from 'konva/lib/Stage';
import {
  ActiveCellPosition,
  CellFormulaDragSelection,
  CellSelection,
  FormulaCellSelection,
  FormulaEntity,
  Point,
} from '../types';
import { generateRandomColor } from '../lib/color';
import { getCellAddressLabel } from '../lib/spreadsheet';
import { getEntityCountByType } from '../lib/formula';
import { getCellContainer, getNumberFromPXString } from '../lib/dom';
import Cell from '../lib/cell';
import { MaxColumns, MaxRows } from '../constants';

export interface SpreadsheetState {
  activeCell: [number, number];
  activeCellPosition: ActiveCellPosition | null;
  canvasStage: Stage | null;
  cellFormulaDragRangeEnd: Point | null;
  cellFormulaDragRangeSelection: CellFormulaDragSelection | null;
  cellFormulaDragRangeStart: Point | null;
  cellRangeEnd: Point | null;
  cellRangeSelection: CellSelection | null;
  cellRangeStart: Point | null;
  columnWidths: Record<number, number>;
  data: Cell[][];
  emptyFormulaCellSelectionPoints: () => void;
  finishSelectingCellsForFormula: () => void;
  formulaCellSelections: FormulaCellSelection[];
  getCell: (row: number, column: number) => Cell | null;
  getColumnWidth: (columnIndex: number) => number;
  getMatrixValues: () => Array<Cell['value'][]>;
  insertNewColumnAt: (column: number, where: 'before' | 'after') => void;
  insertNewRowAt: (row: number, where: 'before' | 'after') => void;
  isCellEditorFocused: boolean;
  isEditingAtFormulaEditor: boolean;
  isSelectingCellsForCellFormulaRange: boolean;
  isSelectingCellsForFormula: boolean;
  setActiveCell: (
    row: number,
    column: number,
    activeCellPosition: ActiveCellPosition
  ) => void;
  setCanvasStage: (canvasStage: Stage) => void;
  setCellData: (row: number, column: number, updateData: Partial<Cell>) => void;
  setCellFormulaDragRangeEnd: (point: Point | null) => void;
  setCellFormulaDragRangeStart: (point: Point | null) => void;
  setCellRangeEnd: (point: Point | null) => void;
  setCellRangeStart: (point: Point | null) => void;
  setColumnWidth: (columnIndex: number, width: number) => void;
  setData: (data: Cell[][]) => void;
  setFormulaCellSelectionPoints: (
    formulaEntities: Cell['formulaEntities']
  ) => void;
  setFormulaEntitiesFromCellSelection: (
    formulaCellSelectionPoint: Point
  ) => void;
  setIsCellEditorFocused: (isCellEditorFocused: boolean) => void;
  setIsEditingAtFormulaEditor: (isEditingAtFormulaEditor: boolean) => void;
  setIsSelectingCellsForCellFormulaRange: (
    isSelectingCellsForCellFormulaRange: boolean
  ) => void;
  setIsSelectingCellsForFormula: (isSelectingCellsForFormula: boolean) => void;
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
  const initialRowData: Cell[][] = [];

  for (let i = 1; i <= MaxRows; i++) {
    const row = [];

    for (let j = 1; j <= MaxColumns; j++) {
      row.push(new Cell(i, j));
    }

    initialRowData.push(row);
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
      cellFormulaDragRangeEnd: null,
      cellFormulaDragRangeStart: null,
      cellFormulaDragRangeSelection: null,
      setData: (data: Cell[][]) => {
        set({ data });
      },
      getCell: (row: number, column: number) => {
        const { data } = get();

        if (data[row] && data[row][column]) {
          return data[row][column];
        }

        return null;
      },
      setActiveCell: (
        row: number,
        column: number,
        activeCellPosition: ActiveCellPosition
      ) => {
        set({
          activeCell: [row, column],
          cellFormulaDragRangeSelection: null,
          activeCellPosition,
        });
      },
      insertNewRowAt: (row: number, where: 'before' | 'after') => {
        const { data } = get();
        const rowIndex = where === 'before' ? row - 1 : row;
        const newUUIDs: Cell[] = [];

        data.splice(rowIndex, 0, newUUIDs);

        set({
          data: [...data],
        });
      },
      insertNewColumnAt: (column: number, where: 'before' | 'after') => {
        const { data } = get();
        const columnIndex = where === 'before' ? column - 1 : column;

        for (let i = 0; i < data.length; i++) {
          data[i].splice(columnIndex, 0, new Cell());
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

        const { cellRangeStart, data } = get();

        if (cellRangeStart === null) {
          return;
        }

        // TODO: Idk why but need to get back on the context of this one.
        //  The 2 loops below seems wrong but it works. :D
        const [startRow, startCol] = cellRangeStart;
        const [endRow, endCol] = point;

        const startCellCol = Math.min(startCol, endCol);
        const startCellRow = Math.min(startRow, endRow);

        const endCellCol = Math.max(startCol, endCol);
        const endCellRow = Math.max(startRow, endRow);

        const startCell = data[startCellRow][startCellCol];

        let width = 0;
        let height = 0;

        for (let row = startCellRow; row <= endCellRow; row++) {
          height += data[row][startCellCol].height;
        }

        for (let col = startCellCol; col <= endCellCol; col++) {
          width += data[startCellRow][col].width;
        }

        set({
          cellRangeSelection: {
            width,
            top: startCell.y,
            left: startCell.x,
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
      setCellData: (row: number, column: number, updateData: Partial<Cell>) => {
        const { data } = get();

        data[row][column] = {
          ...data[row][column],
          ...updateData,
        };

        if (data[row][column].value.trim() === '') {
          data[row][column].formulaEntities = [];
          data[row][column].result = '';
        }

        set({ data: [...data] });
      },
      setFormulaCellSelectionPoints: (
        formulaEntities: Cell['formulaEntities']
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
      setCellFormulaDragRangeEnd: (point: Point | null) => {
        if (point === null) {
          set({
            cellFormulaDragRangeSelection: null,
            cellFormulaDragRangeStart: null,
            cellFormulaDragRangeEnd: null,
          });
          return;
        }

        const { cellFormulaDragRangeStart } = get();

        if (cellFormulaDragRangeStart === null) {
          return;
        }

        const [startRow, startCol] = cellFormulaDragRangeStart;
        const [endRow, endCol] = point;

        // Only process if dragging is in straight line
        if (
          Math.abs(endRow - startRow) >= 1 &&
          Math.abs(endCol - startCol) >= 1
        ) {
          return;
        }

        let startCellCol = Math.min(startCol, endCol);
        let startCellRow = Math.min(startRow, endRow);
        let endCellCol = Math.max(startCol, endCol);
        let endCellRow = Math.max(startRow, endRow);

        const line = startCellCol === endCellCol ? 'column' : 'row';
        let direction: CellFormulaDragSelection['direction'] = '';

        // This is kinda ugly but I just fixed the no-lonely-if eslint issue.
        if (line === 'row') {
          if (startCol >= endCol) {
            endCellCol -= 1;
            direction = 'left';
          } else {
            startCellCol += 1;
            direction = 'right';
          }
        } else if (startRow >= endRow) {
          endCellRow -= 1;
          direction = 'top';
        } else {
          startCellRow += 1;
          direction = 'bottom';
        }

        const cellElement = getCellContainer(startCellRow, startCellCol);

        if (cellElement === null) {
          return;
        }

        let width = 0;
        let height = 0;

        // TODO: I think that we can remove the other for loop here
        //  add checking of direction of drag, then just loop on that
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
          cellFormulaDragRangeSelection: {
            width,
            height,
            direction,
            left: getNumberFromPXString(cellElement.style.left),
            top: getNumberFromPXString(cellElement.style.top),
          },
          cellFormulaDragRangeEnd: point,
        });
      },
      setCellFormulaDragRangeStart: (point: Point | null) => {
        set({
          cellFormulaDragRangeStart: point,
        });
      },
      isSelectingCellsForCellFormulaRange: false,
      setIsSelectingCellsForCellFormulaRange: (
        isSelectingCellsForCellFormulaRange: boolean
      ) => {
        set({
          isSelectingCellsForCellFormulaRange,
        });
      },
      finishSelectingCellsForFormula: () => {
        const {
          cellFormulaDragRangeSelection,
          cellFormulaDragRangeStart,
          cellFormulaDragRangeEnd,
        } = get();

        set({
          isSelectingCellsForCellFormulaRange: false,
          cellRangeStart: cellFormulaDragRangeStart,
          cellRangeEnd: cellFormulaDragRangeEnd,
          cellRangeSelection: cellFormulaDragRangeSelection,
          cellFormulaDragRangeStart: null,
          cellFormulaDragRangeEnd: null,
          cellFormulaDragRangeSelection: null,
        });
      },
      activeCellPosition: null,
      isCellEditorFocused: false,
      setIsCellEditorFocused: (isCellEditorFocused: boolean) => {
        set({ isCellEditorFocused });
      },
      canvasStage: null,
      setCanvasStage: (canvasStage: Stage) => {
        set({ canvasStage });
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
                'cellFormulaDragRangeEnd',
                'cellFormulaDragRangeSelection',
                'cellFormulaDragRangeStart',
                'isSelectingCellsForCellFormulaRange',
                'activeCellPosition',
                'activeCell',
              ].includes(key)
          )
        ),
    }
  )
);

export { useSpreadsheet };
