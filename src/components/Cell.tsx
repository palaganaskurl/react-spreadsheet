import React from 'react';
import { CellProps } from '../types';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { placeCaretAtEnd } from '../lib/dom';
import useFormulaEditor from '../lib/hooks/useFormulaEditor';

const CellStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderBottom: 'thin solid #e0e0e0',
  borderRight: 'thin solid #e0e0e0',
  outline: '0px solid transparent',
};
const ActiveCellNoContent = {
  caretColor: 'transparent',
  cursor: 'default',
};

const Cell = ({
  row,
  column,
  value,
  result,
  formulaEntities,
  style,
}: CellProps) => {
  const setCellData = useSpreadsheet((state) => state.setCellData);
  const setActiveCell = useSpreadsheet((state) => state.setActiveCell);
  const isEditingAtFormulaEditor = useSpreadsheet(
    (state) => state.isEditingAtFormulaEditor
  );
  const [isEditing, setEditing] = React.useState<boolean>(false);

  const cellRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (cellRef.current !== null) {
      if (isSelectingCellsForFormula) {
        cellRef.current.textContent = (value || '').toString();
      } else {
        cellRef.current.textContent =
          result?.toString() || (value || '').toString();
      }

      if (!isEditingAtFormulaEditor) {
        placeCaretAtEnd(cellRef.current);
      }
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

            if (value.startsWith('=')) {
              setIsSelectingCellsForFormula(true);
              setActiveCell(row, column);
              parseFormula(e);
            }

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
      onKeyDown={(e) => {
        if (e.defaultPrevented) {
          return; // Do nothing if the event was already processed
        }

        switch (e.key) {
          case 'ArrowDown': {
            setEditing(false);
            setActiveCell(row + 1, column);
            e.preventDefault();
            break;
          }
          case 'ArrowUp': {
            setEditing(false);
            setActiveCell(row - 1, column);
            e.preventDefault();
            break;
          }
          case 'ArrowLeft': {
            setEditing(false);
            setActiveCell(row, column - 1);
            e.preventDefault();
            break;
          }
          case 'ArrowRight': {
            setEditing(false);
            setActiveCell(row, column + 1);
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

            // TODO: Ideally, this should be set to the value
            //  before Enter or Blurred.
            // Maybe need to check on saving the value while
            //  user is inputting
            setCellData(row, column, {
              value,
            });

            break;
          }
          default:
            break;
        }
      }}
      style={{
        ...CellStyle,
        ...(!isEditing ? ActiveCellNoContent : {}),
        ...style,
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
        // TODO: Don't initiate dragging when mouse didn't moved
        //  from starting cell.
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
