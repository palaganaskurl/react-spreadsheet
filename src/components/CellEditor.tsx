import React from 'react';
import { createPortal } from 'react-dom';
import useFormulaEditor from '../lib/hooks/useFormulaEditor';
import { useSpreadsheet } from '../state/useSpreadsheet';
import {
  getCellContainer,
  getNumberFromPXString,
  placeCaretAtEnd,
} from '../lib/dom';

const CellEditor = () => {
  // TODO: When write method is "append", make the cursor
  const [activeRow, activeColumn] = useSpreadsheet((state) => state.activeCell);
  const activeCellElement = getCellContainer(activeRow, activeColumn);
  const writeMethod = useSpreadsheet((state) => state.writeMethod);
  const setWriteMethod = useSpreadsheet((state) => state.setWriteMethod);
  const setCellData = useSpreadsheet((state) => state.setCellData);
  const getCell = useSpreadsheet((state) => state.getCell);
  const cellData = getCell(activeRow, activeColumn);
  const setIsSelectingCellsForFormula = useSpreadsheet(
    (state) => state.setIsSelectingCellsForFormula
  );
  const setActiveCell = useSpreadsheet((state) => state.setActiveCell);
  const emptyFormulaCellSelectionPoints = useSpreadsheet(
    (state) => state.emptyFormulaCellSelectionPoints
  );
  const { resolveFormula, parseFormula } = useFormulaEditor();
  const gridContainer = document.querySelector('#gridContainer');

  const inputBoxRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (inputBoxRef.current === null) {
      return;
    }

    placeCaretAtEnd(inputBoxRef.current);
  }, [cellData]);

  if (activeCellElement === null) {
    return null;
  }

  if (gridContainer === null) {
    return null;
  }

  if (cellData === null) {
    return null;
  }

  const getCellValue = () => {
    if (writeMethod === 'overwrite') {
      if (!cellData?.result) {
        return cellData.value;
      }

      if (typeof cellData?.result === 'object') {
        // @ts-expect-error
        // eslint-disable-next-line
        return cellData?.result._error;
      }

      return cellData?.result.toString();
    }

    return cellData.value;
  };

  const cellElementBoundingClientRect =
    activeCellElement.getBoundingClientRect();

  return createPortal(
    <div
      role="textbox"
      tabIndex={0}
      ref={inputBoxRef}
      id="inputBox"
      contentEditable
      style={{
        width: `${cellElementBoundingClientRect.width}px`,
        height: `${cellElementBoundingClientRect.height}px`,
        top: `${getNumberFromPXString(activeCellElement.style.top)}px`,
        left: `${getNumberFromPXString(activeCellElement.style.left)}px`,
        position: 'absolute',
        pointerEvents: 'none',
        outline:
          writeMethod === 'overwrite'
            ? '0px solid transparent'
            : '2px solid lightblue',
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
        const cellContent = e.currentTarget.textContent || '';

        if (cellContent.startsWith('=')) {
          setIsSelectingCellsForFormula(true);
          setWriteMethod('append');
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
            const cellContent = e.currentTarget.textContent ?? '';

            setIsSelectingCellsForFormula(false);

            const { evaluatedFormula, formulaResult } = resolveFormula(
              cellData?.value || ''
            );

            if (evaluatedFormula && formulaResult) {
              // Since the Cell is memoized, it doesn't re-render
              //  when the formulaResult is the same.
              // Temporarily, we set the cellRef textContent
              //  manually.
              // cellRef.current!.textContent = formulaResult;
            } else {
              setCellData(activeRow, activeColumn, {
                value: cellContent,
              });
            }

            emptyFormulaCellSelectionPoints();
            setActiveCell(activeRow + 1, activeColumn);
            setWriteMethod('overwrite');

            break;
          }
          case 'Escape': {
            setIsSelectingCellsForFormula(false);
            emptyFormulaCellSelectionPoints();

            // TODO: Ideally, this should be set to the value
            //  before Enter or Blurred.
            // Maybe need to check on saving the value while
            //  user is inputting
            setCellData(activeRow, activeColumn, {
              value: cellData?.value,
            });
            setWriteMethod('overwrite');
            break;
          }
          default:
            break;
        }
      }}
    >
      {getCellValue()}
    </div>,
    gridContainer
  );
};

export default CellEditor;
