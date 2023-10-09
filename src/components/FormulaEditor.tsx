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
  const getCell = useSpreadsheet((state) => state.getCell);

  const setIsSelectingCellsForFormula = useSpreadsheet(
    (state) => state.setIsSelectingCellsForFormula
  );

  const onFormulaInput = (e: React.FormEvent<HTMLDivElement>) => {
    const formula = e.currentTarget.textContent?.trim() || '';

    setIsSelectingCellsForFormula(formula.startsWith('='));
    setCellValue(activeCellRow, activeCellColumn, formula);
  };

  const activeCellValue = getCell(activeCellRow, activeCellColumn);

  const formulaRef = React.useRef<HTMLDivElement | null>(null);

  // TODO: Try to format formula entities with color
  // const renderFormulaEntities = () => {
  //   if (activeCellValue?.formulaEntities.size === 0) {
  //     return null;
  //   }

  //   return Array.from(activeCellValue?.formulaEntities || []).map((x) => (
  //     <>
  //       <span key={uuidv4()}>{x.address}</span>
  //     </>
  //   ));
  // };

  React.useEffect(() => {
    formulaRef!.current!.textContent = activeCellValue?.value || '';
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
        suppressContentEditableWarning
        contentEditable
        className={classNames({
          'Spreadsheet-Formula-Editor': true,
        })}
        onInput={onFormulaInput}
        ref={formulaRef}
        onKeyUp={(e) => {
          switch (e.key) {
            case 'Enter': {
              if (activeCellValue?.value) {
                resolveFormula(activeCellValue.value);
              }

              break;
            }
            default:
              break;
          }
        }}
        tabIndex={0}
        aria-label="Formula Editor"
        role="textbox"
      >
        {/* {renderFormulaEntities()} */}
      </div>
    </div>
  );
};

export default FormulaEditor;
