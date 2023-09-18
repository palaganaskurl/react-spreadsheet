import React from 'react';
import classNames from 'classnames';
import { useSpreadsheet } from '../state/useSpreadsheet';

const FormulaEditor = () => {
  const [activeCellRow, activeCellColumn] = useSpreadsheet(
    (state) => state.activeCell
  );
  const setCellValue = useSpreadsheet((state) => state.setCellValue);
  const getCellValue = useSpreadsheet((state) => state.getCellValue);

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
    // Fix this shit TypeScript issue.
    formulaRef!.current!.textContent = activeCellValue;
  }, [activeCellValue]);

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
      />
    </div>
  );
};

export default FormulaEditor;
