import React from 'react';
import classNames from 'classnames';
import { CellProps } from '../types';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { placeCaretAtEnd } from '../lib/dom';

const Cell = ({ width, height, row, column, id, value, result }: CellProps) => {
  const setCellValue = useSpreadsheet((state) => state.setCellValue);
  const setActiveCell = useSpreadsheet((state) => state.setActiveCell);
  const [isEditing, setEditing] = React.useState<boolean>(false);

  const cellRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (cellRef.current !== null) {
      cellRef.current.textContent =
        result?.toString() || (value || '').toString();

      placeCaretAtEnd(cellRef.current);
    }
  }, [value, result]);

  const isDraggingCellRange = useSpreadsheet(
    (state) => state.isDraggingCellRange
  );
  const setIsDraggingCellRange = useSpreadsheet(
    (state) => state.setIsDraggingCellRange
  );
  const setCellRangeStart = useSpreadsheet((state) => state.setCellRangeStart);
  const setCellRangeEnd = useSpreadsheet((state) => state.setCellRangeEnd);

  const [mouseMoved, setMouseMoved] = React.useState<boolean>(false);

  const [writeMethod, setWriteMethod] = React.useState<'overwrite' | 'append'>(
    'overwrite'
  );

  const isSelectingCellsForFormula = useSpreadsheet(
    (state) => state.isSelectingCellsForFormula
  );
  const setFormulaCellSelectionPoint = useSpreadsheet(
    (state) => state.setFormulaCellSelectionPoint
  );

  const setIsSelectingCellsForFormula = useSpreadsheet(
    (state) => state.setIsSelectingCellsForFormula
  );
  const emptyFormulaCellSelectionPoints = useSpreadsheet(
    (state) => state.emptyFormulaCellSelectionPoints
  );

  const setActiveCellConditionally = () => {
    if (isSelectingCellsForFormula) {
      setFormulaCellSelectionPoint([row, column]);

      return;
    }

    setActiveCell(row, column);
  };

  return (
    <div
      id={id}
      onBlur={() => {
        setEditing(false);
      }}
      // TODO: Think of a better way to not rely on data-attributes
      //  in range selection
      data-row={row}
      data-column={column}
      ref={cellRef}
      contentEditable
      aria-label="Cell"
      role="textbox"
      tabIndex={0}
      suppressContentEditableWarning // TODO: Check on this later on
      onClick={(e) => {
        switch (e.detail) {
          case 1: {
            setActiveCellConditionally();
            setWriteMethod('overwrite');

            break;
          }
          case 2: {
            setEditing(true);
            setActiveCellConditionally();
            setWriteMethod('append');

            if (cellRef.current) {
              placeCaretAtEnd(cellRef.current);
            }

            break;
          }
          default: {
            break;
          }
        }
      }}
      onKeyUp={(e) => {
        switch (e.key) {
          case 'Enter': {
            setEditing(false);
            setActiveCell(row + 1, column);
            setCellValue(
              row,
              column,
              e.currentTarget.textContent?.trim() as string
            );
            setIsSelectingCellsForFormula(false);
            emptyFormulaCellSelectionPoints();

            break;
          }
          case 'Escape': {
            setEditing(false);
            setIsSelectingCellsForFormula(false);
            emptyFormulaCellSelectionPoints();

            // TODO: Might cause issue, check if editing or selecting cells
            //  before setting the value to empty
            setCellValue(row, column, '');

            break;
          }
          default:
            break;
        }
      }}
      className={classNames({
        'Spreadsheet-Cell': true,
        'Spreadsheet-Active-Cell-No-Content': !isEditing,
      })}
      style={{
        minWidth: `${width}px`,
        minHeight: `${height}px`,
        maxWidth: `${width}px`,
      }}
      onBeforeInput={(e) => {
        if (writeMethod === 'overwrite') {
          e.currentTarget.textContent = '';
        }
      }}
      onInput={(e) => {
        const cellContent = e.currentTarget.textContent?.trim() || '';

        if (cellContent.startsWith('=')) {
          setIsSelectingCellsForFormula(true);
          setActiveCell(row, column);
        }

        if (writeMethod === 'overwrite') {
          setWriteMethod('append');
        }

        setCellValue(row, column, cellContent);
      }}
      onMouseDown={() => {
        setMouseMoved(false);
        setIsDraggingCellRange(true);
        setCellRangeStart([row, column]);

        // To avoid double calling of setActiveCellConditionally,
        //  will no execute setActiveCellConditionally here
        //  to avoid adding two formula selection point.
        if (!isSelectingCellsForFormula) {
          setActiveCell(row, column);
        }
      }}
      onMouseMove={(e) => {
        setMouseMoved(true);

        if (
          isDraggingCellRange &&
          !isSelectingCellsForFormula &&
          e.target instanceof HTMLDivElement
        ) {
          const targetRow = parseInt(e.target.dataset.row as string, 10);
          const targetColumn = parseInt(e.target.dataset.column as string, 10);

          setCellRangeEnd([targetRow, targetColumn]);
        }
      }}
      onMouseUp={(e) => {
        setIsDraggingCellRange(false);

        if (mouseMoved && !isSelectingCellsForFormula) {
          if (e.target instanceof HTMLDivElement) {
            const targetRow = parseInt(e.target.dataset.row as string, 10);
            const targetColumn = parseInt(
              e.target.dataset.column as string,
              10
            );

            setCellRangeEnd([targetRow, targetColumn]);
          }

          setMouseMoved(false);
        } else {
          setCellRangeEnd(null);
        }
      }}
    />
  );
};

export default React.memo(Cell);
