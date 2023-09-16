import React from 'react';
import classNames from 'classnames';
import { CellProps } from '../types';
import { useSpreadsheet } from '../state/useSpreadsheet';

const Cell = ({ width, height, row, column }: CellProps) => {
  const setCellValue = useSpreadsheet((state) => state.setCellValue);
  // const getCellValue = useSpreadsheet((state) => state.getCellValue);
  const [activeCellRow, activeCellColumn] = useSpreadsheet(
    (state) => state.activeCell
  );
  const setActiveCell = useSpreadsheet((state) => state.setActiveCell);
  const [editing, setEditing] = React.useState<boolean>(false);
  const isContentEditable =
    activeCellRow === row && activeCellColumn === column && editing;

  const cellRef = React.useRef<HTMLDivElement>(null);

  // const [cellContent, setCellContent] = React.useState('');

  // React.useEffect(() => {
  //   if (cellRef.current) {
  //     // moveCursorToEnd(inputRef.current);
  //     console.log('cell ref', cellRef);
  //   }
  // }, [cellRef]);

  return (
    <div
      onBlur={() => {
        setEditing(false);
        console.log(
          'cellRef.current?.textContent',
          cellRef.current?.textContent,
          cellRef.current?.textContent?.trim() === '',
          typeof cellRef.current?.textContent
        );
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
            setEditing(true);

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
        'Spreadsheet-Active-Cell-No-Content':
          cellRef.current?.textContent?.trim() === '',
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
