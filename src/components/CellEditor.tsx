import React from 'react';
import useFormulaEditor from '../lib/hooks/useFormulaEditor';
import { useSpreadsheet } from '../state/useSpreadsheet';

const CellEditor = () => {
  const [activeRow, activeColumn] = useSpreadsheet((state) => state.activeCell);
  const [writeMethod, setWriteMethod] = React.useState<'overwrite' | 'append'>(
    'overwrite'
  );
  const setCellData = useSpreadsheet((state) => state.setCellData);
  const getCell = useSpreadsheet((state) => state.getCell);
  const cellData = getCell(activeRow, activeColumn);
  const setIsSelectingCellsForFormula = useSpreadsheet(
    (state) => state.setIsSelectingCellsForFormula
  );
  const setActiveCell = useSpreadsheet((state) => state.setActiveCell);
  const { resolveFormula, parseFormula } = useFormulaEditor();

  const inputBoxRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      role="textbox"
      tabIndex={0}
      ref={inputBoxRef}
      id="inputBox"
      contentEditable
      style={{
        width: '100%',
        height: '100%',
        outline: '0px solid transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      suppressContentEditableWarning
      onBeforeInput={(e) => {
        if (writeMethod === 'overwrite') {
          e.currentTarget.textContent = '';
        }
      }}
      onInput={(e) => {
        const cellContent = e.currentTarget.textContent?.trim() || '';

        if (cellContent.startsWith('=')) {
          setIsSelectingCellsForFormula(true);
          setActiveCell(activeRow, activeColumn); // TODO: Check if this can be removed
          parseFormula(e);
        }

        if (writeMethod === 'overwrite') {
          setWriteMethod('append');
        }

        setCellData(activeRow, activeColumn, {
          value: cellContent,
        });
      }}
      onKeyDown={(e) => {
        if (e.defaultPrevented) {
          return; // Do nothing if the event was already processed
        }

        switch (e.key) {
          case 'ArrowDown': {
            setActiveCell(activeRow + 1, activeColumn);
            e.preventDefault();
            break;
          }
          case 'ArrowUp': {
            setActiveCell(activeRow - 1, activeColumn);
            e.preventDefault();
            break;
          }
          case 'ArrowLeft': {
            setActiveCell(activeRow, activeColumn - 1);
            e.preventDefault();
            break;
          }
          case 'ArrowRight': {
            setActiveCell(activeRow, activeColumn + 1);
            e.preventDefault();
            break;
          }
          default:
            break;
        }
      }}
      onKeyUp={(e) => {
        switch (e.key) {
          case 'Enter': {
            // setEditing(false);
            setIsSelectingCellsForFormula(false);

            const { evaluatedFormula, formulaResult } = resolveFormula(
              cellData?.value
            );

            console.log('evaluatedFormula', evaluatedFormula, formulaResult);

            if (evaluatedFormula && formulaResult) {
              // Since the Cell is memoized, it doesn't re-render
              //  when the formulaResult is the same.
              // Temporarily, we set the cellRef textContent
              //  manually.
              // cellRef.current!.textContent = formulaResult;
            }

            // emptyFormulaCellSelectionPoints();
            setActiveCell(activeRow + 1, activeColumn);
            setCellData(activeRow, activeColumn, {
              value: e.currentTarget.textContent,
            });

            break;
          }
          case 'Escape': {
            // setEditing(false);
            // setIsSelectingCellsForFormula(false);
            // emptyFormulaCellSelectionPoints();
            // // TODO: Ideally, this should be set to the value
            // //  before Enter or Blurred.
            // // Maybe need to check on saving the value while
            // //  user is inputting
            // setCellData(row, column, {
            //   value,
            // });
            break;
          }
          default:
            break;
        }
      }}
    >
      {cellData?.value}
    </div>
  );
};

export default CellEditor;
