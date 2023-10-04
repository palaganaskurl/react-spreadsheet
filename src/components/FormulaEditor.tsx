import React from 'react';
import classNames from 'classnames';
import useFormulaEditor from '../lib/hooks/useFormulaEditor';
import { useSpreadsheet } from '../state/useSpreadsheet';

const FormulaEditor = () => {
  const { resolveFormula } = useFormulaEditor();

  const [activeCellRow, activeCellColumn] = useSpreadsheet(
    (state) => state.activeCell
  );
  const setCellValue = useSpreadsheet((state) => state.setCellValue);
  const getCellValue = useSpreadsheet((state) => state.getCellValue);

  const setIsSelectingCellsForFormula = useSpreadsheet(
    (state) => state.setIsSelectingCellsForFormula
  );

  const onFormulaInput = (e: React.FormEvent<HTMLDivElement>) => {
    const formula = e.currentTarget.textContent?.trim() || '';

    setIsSelectingCellsForFormula(formula.startsWith('='));
    setCellValue(activeCellRow, activeCellColumn, formula);
  };

  const activeCellValue = getCellValue(activeCellRow, activeCellColumn);

  const formulaRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
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
        onKeyUp={(e) => {
          if (e.key === 'Enter') {
            resolveFormula(e);
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
