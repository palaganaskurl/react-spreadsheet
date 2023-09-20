import React from 'react';
import classNames from 'classnames';
import { CellProps } from '../types';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { placeCaretAtEnd } from '../lib/dom';

const Cell = ({ width, height, row, column, id, value, result }: CellProps) => {
  const setCellValue = useSpreadsheet((state) => state.setCellValue);
  const [activeCellRow, activeCellColumn] = useSpreadsheet(
    (state) => state.activeCell
  );
  const setActiveCell = useSpreadsheet((state) => state.setActiveCell);
  const [isEditing, setEditing] = React.useState<boolean>(false);

  const cellRef = React.useRef<HTMLDivElement>(null);

  // TODO: On not double click, should overwrite all content
  React.useEffect(() => {
    cellRef!.current!.textContent =
      result?.toString() || (value || '').toString();
  }, [cellRef, value, result]);

  const isDraggingCellRange = useSpreadsheet(
    (state) => state.isDraggingCellRange
  );
  const setIsDraggingCellRange = useSpreadsheet(
    (state) => state.setIsDraggingCellRange
  );
  const setCellRangeStart = useSpreadsheet((state) => state.setCellRangeStart);
  const setCellRangeEnd = useSpreadsheet((state) => state.setCellRangeEnd);

  // TODO: This fixed the issue where clicking on a cell makes it look like
  //  it will be dragged. But it now shows a delay of clearing the selection
  //   after dragging.
  const [mouseMoved, setMouseMoved] = React.useState<boolean>(false);

  const [writeMethod, setWriteMethod] = React.useState<'overwrite' | 'append'>(
    'overwrite'
  );

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
      onClick={(event) => {
        switch (event.detail) {
          case 1: {
            setActiveCell(row, column);
            setWriteMethod('overwrite');

            break;
          }
          case 2: {
            setEditing(true);
            setActiveCell(row, column);
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
        if (e.key === 'Enter') {
          setEditing(false);
          setActiveCell(row + 1, column);
          setCellValue(
            row,
            column,
            e.currentTarget.textContent?.trim() as string
          );
        }
      }}
      className={classNames({
        'Spreadsheet-Cell': true,
        'Spreadsheet-Active-Cell':
          activeCellRow === row && activeCellColumn === column,
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
        if (writeMethod === 'overwrite') {
          setWriteMethod('append');
        }

        setCellValue(
          row,
          column,
          e.currentTarget.textContent?.trim() as string
        );
      }}
      onMouseDown={() => {
        setMouseMoved(false);
        setIsDraggingCellRange(true);
        setCellRangeStart([row, column]);
        setActiveCell(row, column);
      }}
      onMouseMove={(e) => {
        setMouseMoved(true);

        if (isDraggingCellRange && e.target instanceof HTMLDivElement) {
          const targetRow = parseInt(e.target.dataset.row as string, 10);
          const targetColumn = parseInt(e.target.dataset.column as string, 10);

          setCellRangeEnd([targetRow, targetColumn]);
        }
      }}
      onMouseUp={(e) => {
        setIsDraggingCellRange(false);

        if (mouseMoved) {
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
          setCellRangeEnd([-1, -1]);
        }
      }}
    >
      <span
        style={{
          minWidth: `${width}px`,
          minHeight: `${height}px`,
          maxWidth: `${width}px`,
        }}
      />
    </div>
    // &#xFEFF;
  );
};

export default React.memo(Cell);
