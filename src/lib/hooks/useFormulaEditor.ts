import React from 'react';
// @ts-expect-error
import FormulaParser from 'fast-formula-parser';
import { useSpreadsheet } from '../../state/useSpreadsheet';
import { parseFormula as parseFormulaHelper } from '../formula';
import { FormulaEntity } from '../../types';
import { cellAddressToIndex, getCellAddressLabel } from '../spreadsheet';
import { generateRandomColor } from '../color';

const useFormulaEditor = () => {
  const getMatrixValues = useSpreadsheet((state) => state.getMatrixValues);
  const [activeCellRow, activeCellColumn] = useSpreadsheet(
    (state) => state.activeCell
  );
  const setCellData = useSpreadsheet((state) => state.setCellData);
  const setFormulaCellSelectionPoints = useSpreadsheet(
    (state) => state.setFormulaCellSelectionPoints
  );

  const parseFormula = (e: React.FormEvent<HTMLDivElement>) => {
    const parsedFormula = parseFormulaHelper(e.currentTarget.textContent ?? '');
    const entities: FormulaEntity[] = [];

    parsedFormula.forEach((entity) => {
      const cellAddressRowCol = cellAddressToIndex(entity.value);

      if (cellAddressRowCol === null) {
        entities.push({
          operation: entity.value,
          type: 'operation',
        });
      } else {
        const { row, column } = cellAddressRowCol;
        const cellAddress = getCellAddressLabel(row, column);

        entities.push({
          row,
          column,
          address: cellAddress,
          type: 'variable',
          borderColor: generateRandomColor(),
        });
      }
    });

    setCellData(activeCellRow, activeCellColumn, {
      formulaEntities: entities,
    });
    setFormulaCellSelectionPoints(entities);
  };

  const resolveFormula = (
    cellContent: string
  ): {
    evaluatedFormula: boolean;
    formulaResult?: any;
  } => {
    const matrixValues = getMatrixValues();
    const formulaParser = new FormulaParser({
      onCell: ({ row, col }: { col: number; row: number; sheet: string }) =>
        matrixValues[row - 1][col - 1],
    });

    if (cellContent?.startsWith('=')) {
      const formulaResult = formulaParser.parse(cellContent.substring(1));

      if (formulaResult !== '#VALUE!') {
        setCellData(activeCellRow, activeCellColumn, {
          result: formulaResult,
        });
      }

      return {
        evaluatedFormula: true,
        formulaResult,
      };
    }

    setCellData(activeCellRow, activeCellColumn, {
      value: cellContent,
    });

    return {
      evaluatedFormula: false,
    };
  };

  return {
    resolveFormula,
    parseFormula,
  };
};

export default useFormulaEditor;
