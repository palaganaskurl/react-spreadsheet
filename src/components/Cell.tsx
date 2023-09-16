import React from 'react';
import classNames from 'classnames';
import { CellProps } from '../types';
import { useSpreadsheet } from '../state/useSpreadsheet';

const Cell = ({ width, height, row, column }: CellProps) => {
  const setCellValue = useSpreadsheet((state) => state.setCellValue);
  const [activeCellRow, activeCellColumn] = useSpreadsheet(
    (state) => state.activeCell
  );
  const setActiveCell = useSpreadsheet((state) => state.setActiveCell);
  const [isEditing, setEditing] = React.useState<boolean>(false);
  const isContentEditable =
    activeCellRow === row && activeCellColumn === column;

  const cellRef = React.useRef<HTMLDivElement>(null);

  // TODO: On not double click, should overwrite all content

  return (
    <div
      onBlur={() => {
        setEditing(false);
      }}
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
