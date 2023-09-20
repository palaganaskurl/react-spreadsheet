import React from 'react';
import classNames from 'classnames';
// @ts-expect-error
import FormulaParser from 'fast-formula-parser';
import { useSpreadsheet } from '../state/useSpreadsheet';

const FormulaEditor = () => {
  const [activeCellRow, activeCellColumn] = useSpreadsheet(
    (state) => state.activeCell
  );
  const setCellValue = useSpreadsheet((state) => state.setCellValue);
  const setCellResult = useSpreadsheet((state) => state.setCellResult);
  const getCellValue = useSpreadsheet((state) => state.getCellValue);
  const getMatrixValues = useSpreadsheet((state) => state.getMatrixValues);

  const onFormulaInput = (e: React.FormEvent<HTMLDivElement>) => {
    setCellValue(
      activeCellRow,
      activeCellColumn,
      e.currentTarget.textContent?.trim() as string
    );
  };

  const activeCellValue = getCellValue(activeCellRow, activeCellColumn);

  const formulaRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    formulaRef!.current!.textContent = activeCellValue;
  }, [activeCellValue]);

  const onEnter = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const data = getMatrixValues();

    console.log('Data', data);

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

      console.log('parser parse', formulaParser.parse(formula.substring(1)));
      setCellResult(activeCellRow, activeCellColumn, formulaResult);
    }

    // setCellValue(
    //   activeCellRow,
    //   activeCellColumn,
    //   e.currentTarget.textContent?.trim() as string
    // );
  };

  return (
    <div
      className={classNames({
        'Spreadsheet-Formula': true,
      })}
    >
      <div
        className={classNames({
          'Spreadsheet-Formula-Editor-Icon': true,
        })}
      >
        <img
          alt="formula-icon"
          height="15"
          // eslint-disable-next-line
          src={require('../assets/images/formula-fx-icon.svg')} // TODO: Fix this
        />
      </div>
      <div
        contentEditable
        className={classNames({
          'Spreadsheet-Formula-Editor': true,
        })}
        onInput={onFormulaInput}
        ref={formulaRef}
        onKeyUp={(e) => {
          if (e.key === 'Enter') {
            onEnter(e);
          }
        }}
        tabIndex={0}
        aria-label="Formula Editor"
        role="textbox"
      />
    </div>
  );
};

export default FormulaEditor;
