import React from 'react';
// @ts-expect-error
import FormulaParser from 'fast-formula-parser';
import { useSpreadsheet } from '../../state/useSpreadsheet';

const useFormulaEditor = () => {
  const setCellResult = useSpreadsheet((state) => state.setCellResult);
  const getMatrixValues = useSpreadsheet((state) => state.getMatrixValues);
  const [activeCellRow, activeCellColumn] = useSpreadsheet(
    (state) => state.activeCell
  );

  const resolveFormula = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const data = getMatrixValues();

    const formula = e.currentTarget.textContent?.trim();

    const formulaParser = new FormulaParser({
      // // Variable used in formulas (defined name)
      // // Should only return range reference or cell reference
      // onVariable: (name, sheetName) => {
      //   // If it is a range reference (A1:B2)
      //   return {
      //     sheet: 'sheet name',
      //     from: {
      //       row: 1,
      //       col: 1,
      //     },
      //     to: {
      //       row: 2,
      //       col: 2,
      //     },
      //   };
      //   // If it is a cell reference (A1)
      //   return {
      //     sheet: 'sheet name',
      //     row: 1,
      //     col: 1,
      //   };
      // },
      // retrieve cell value
      onCell: ({ row, col }: { col: number; row: number; sheet: string }) =>
        data[row - 1][col - 1],
      // // retrieve range values
      // onRange: (ref) => {
      //   // using 1-based index
      //   // Be careful when ref.to.col is MAX_COLUMN or ref.to.row is MAX_ROW, this will result in
      //   // unnecessary loops in this approach.
      //   const arr = [];
      //   for (let row = ref.from.row; row <= ref.to.row; row++) {
      //     const innerArr = [];
      //     if (data[row - 1]) {
      //       for (let col = ref.from.col; col <= ref.to.col; col++) {
      //         innerArr.push(data[row - 1][col - 1]);
      //       }
      //     }
      //     arr.push(innerArr);
      //   }
      //   return arr;
      // },
    });

    // Position of the parsed formula
    // const position = { row: 1, col: 1, sheet: 'Sheet1' };
    if (formula?.startsWith('=')) {
      const formulaResult = formulaParser.parse(formula.substring(1)) as number;

      setCellResult(activeCellRow, activeCellColumn, formulaResult);
    }
  };

  return {
    resolveFormula,
  };
};

export default useFormulaEditor;
