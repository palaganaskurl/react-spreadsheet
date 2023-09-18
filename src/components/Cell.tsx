import React from 'react';
import classNames from 'classnames';
import { CellProps } from '../types';
import { useSpreadsheet } from '../state/useSpreadsheet';

const Cell = ({ width, height, row, column, id, value }: CellProps) => {
  const setCellValue = useSpreadsheet((state) => state.setCellValue);
  const [activeCellRow, activeCellColumn] = useSpreadsheet(
    (state) => state.activeCell
  );
  const setActiveCell = useSpreadsheet((state) => state.setActiveCell);
  const [isEditing, setEditing] = React.useState<boolean>(false);
  // TODO: Consider this to be removed?
  const isContentEditable =
    activeCellRow === row && activeCellColumn === column;

  const cellRef = React.useRef<HTMLDivElement>(null);

  // TODO: On not double click, should overwrite all content
  React.useEffect(() => {
    // TODO: Fix this shit TypeScript issue.
    cellRef!.current!.textContent = value;
  }, [cellRef, value]);

  const isDraggingCellRange = useSpreadsheet(
    (state) => state.isDraggingCellRange
  );
  const setIsDraggingCellRange = useSpreadsheet(
    (state) => state.setIsDraggingCellRange
  );
  const setCellRangeStart = useSpreadsheet((state) => state.setCellRangeStart);
  const setCellRangeEnd = useSpreadsheet((state) => state.setCellRangeEnd);

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
      contentEditable={isContentEditable}
      aria-label="Cell"
      role="textbox"
      tabIndex={0}
      suppressContentEditableWarning // TODO: Check on this later on
      onClick={(event) => {
        switch (event.detail) {
          case 1: {
            setActiveCell(row, column);

            break;
          }
          case 2: {
            setEditing(true);
            setActiveCell(row, column);

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
      onInput={(e) => {
        setCellValue(
          row,
          column,
          e.currentTarget.textContent?.trim() as string
        );
      }}
      onMouseDown={() => {
        setIsDraggingCellRange(true);
        setCellRangeStart([row, column]);
        setActiveCell(row, column);
      }}
      onMouseMove={(e) => {
        if (isDraggingCellRange && e.target instanceof HTMLDivElement) {
          const targetRow = parseInt(e.target.dataset.row as string, 10);
          const targetColumn = parseInt(e.target.dataset.column as string, 10);

          setCellRangeEnd([targetRow, targetColumn]);
        }
      }}
      onMouseUp={(e) => {
        setIsDraggingCellRange(false);

        if (e.target instanceof HTMLDivElement) {
          const targetRow = parseInt(e.target.dataset.row as string, 10);
          const targetColumn = parseInt(e.target.dataset.column as string, 10);

          setCellRangeEnd([targetRow, targetColumn]);
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
