import React from 'react';
import classNames from 'classnames';
import { CellProps } from '../types';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { placeCaretAtEnd } from '../lib/dom';
import useFormulaEditor from '../lib/hooks/useFormulaEditor';

const CellStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderBottom: 'thin solid #e0e0e0',
  borderRight: 'thin solid #e0e0e0',
  padding: '4px',
  outline: '0px solid transparent',
  textWrap: 'nowrap',
};

const Cell = ({
  width,
  height,
  row,
  column,
  id,
  value,
  result,
  formulaEntities,
}: CellProps) => {
  const setCellData = useSpreadsheet((state) => state.setCellData);
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

  const setCellRangeStart = useSpreadsheet((state) => state.setCellRangeStart);
  const setCellRangeEnd = useSpreadsheet((state) => state.setCellRangeEnd);

  const [writeMethod, setWriteMethod] = React.useState<'overwrite' | 'append'>(
    'overwrite'
  );

  const isSelectingCellsForFormula = useSpreadsheet(
    (state) => state.isSelectingCellsForFormula
  );
  const setFormulaEntitiesFromCellSelection = useSpreadsheet(
    (state) => state.setFormulaEntitiesFromCellSelection
  );

  const setIsSelectingCellsForFormula = useSpreadsheet(
    (state) => state.setIsSelectingCellsForFormula
  );
  const emptyFormulaCellSelectionPoints = useSpreadsheet(
    (state) => state.emptyFormulaCellSelectionPoints
  );
  const setFormulaCellSelectionPoints = useSpreadsheet(
    (state) => state.setFormulaCellSelectionPoints
  );

  const setActiveCellConditionally = () => {
    if (isSelectingCellsForFormula) {
      setFormulaEntitiesFromCellSelection([row, column]);

      return;
    }

    setActiveCell(row, column);
  };

  const { resolveFormula, parseFormula } = useFormulaEditor();

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
            cellRef.current!.textContent = value;

            setFormulaCellSelectionPoints(formulaEntities);
            setCellData(row, column, {
              value,
            });
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

            setIsSelectingCellsForFormula(false);

            const { evaluatedFormula, formulaResult } = resolveFormula(value);

            if (evaluatedFormula && formulaResult) {
              // Since the Cell is memoized, it doesn't re-render
              //  when the formulaResult is the same.
              // Temporarily, we set the cellRef textContent
              //  manually.
              cellRef.current!.textContent = formulaResult;
            }

            emptyFormulaCellSelectionPoints();
            setActiveCell(row + 1, column);

            break;
          }
          case 'Escape': {
            setEditing(false);
            setIsSelectingCellsForFormula(false);
            emptyFormulaCellSelectionPoints();

            // TODO: Might cause issue, check if editing or selecting cells
            //  before setting the value to empty
            setCellData(row, column, {
              value: '',
            });

            break;
          }
          default:
            break;
        }
      }}
      className={classNames({
        'Spreadsheet-Active-Cell-No-Content': !isEditing,
      })}
      style={{
        minWidth: `${width}px`,
        minHeight: `${height}px`,
        maxWidth: `${width}px`,
        ...CellStyle,
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
          parseFormula(e);
        }

        if (writeMethod === 'overwrite') {
          setWriteMethod('append');
        }

        setCellData(row, column, {
          value: cellContent,
        });
      }}
      onMouseDown={() => {
        setCellRangeEnd(null);
        setCellRangeStart([row, column]);

        // To avoid double calling of setActiveCellConditionally,
        //  will no execute setActiveCellConditionally here
        //  to avoid adding two formula selection point.
        if (!isSelectingCellsForFormula) {
          setActiveCell(row, column);
        }
      }}
      onMouseMove={(e) => {
        if (
          !isSelectingCellsForFormula &&
          e.target instanceof HTMLDivElement &&
          e.buttons === 1
        ) {
          const targetRow = parseInt(e.target.dataset.row as string, 10);
          const targetColumn = parseInt(e.target.dataset.column as string, 10);

          setCellRangeEnd([targetRow, targetColumn]);
        }
      }}
    />
  );
};

export default React.memo(Cell);
