import React from 'react';
import { CellProps } from '../types';
import { useSpreadsheet } from '../state/useSpreadsheet';

const CellStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderBottom: 'thin solid #e0e0e0',
  borderRight: 'thin solid #e0e0e0',
  outline: '0px solid transparent',
};
const ActiveCellNoContent: React.CSSProperties = {
  caretColor: 'transparent', // TODO: Culprit for the cursor not showing
  cursor: 'default',
};

const Cell = ({ row, column, cell, style }: CellProps) => {
  const setActiveCell = useSpreadsheet((state) => state.setActiveCell);
  const [activeRow, activeColumn] = useSpreadsheet((state) => state.activeCell);
  const isSelectingCellsForFormula = useSpreadsheet(
    (state) => state.isSelectingCellsForFormula
  );

  const cellRef = React.useRef<HTMLDivElement>(null);

  const getCellContent = () => {
    if (
      isSelectingCellsForFormula &&
      activeRow === row &&
      activeColumn === column
    ) {
      return cell.value;
    }

    if (typeof cell.result === 'object') {
      // @ts-expect-error
      // eslint-disable-next-line
      return result._error;
    }

    return cell.result?.toString() || cell.value;
  };

  const setCellRangeStart = useSpreadsheet((state) => state.setCellRangeStart);
  const setCellRangeEnd = useSpreadsheet((state) => state.setCellRangeEnd);

  const setFormulaEntitiesFromCellSelection = useSpreadsheet(
    (state) => state.setFormulaEntitiesFromCellSelection
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

  const isCellActive = () => activeRow === row && activeColumn === column;

  const setWriteMethod = useSpreadsheet((state) => state.setWriteMethod);
  const writeMethod = useSpreadsheet((state) => state.writeMethod);

  const isSelectingCellsForCellFormulaRange = useSpreadsheet(
    (state) => state.isSelectingCellsForCellFormulaRange
  );

  const setCellFormulaDragRangeEnd = useSpreadsheet(
    (state) => state.setCellFormulaDragRangeEnd
  );
  const setIsSelectingCellsForCellFormulaRange = useSpreadsheet(
    (state) => state.setIsSelectingCellsForCellFormulaRange
  );

  return (
    <div
      onKeyDown={() => {}}
      // TODO: Think of a better way to not rely on data-attributes
      //  in range selection
      data-row={row}
      data-column={column}
      ref={cellRef}
      aria-label="Cell"
      role="button"
      tabIndex={0}
      onClick={(e) => {
        switch (e.detail) {
          case 1: {
            setActiveCellConditionally();

            if (!isSelectingCellsForFormula) {
              setWriteMethod('overwrite');
            }

            break;
          }
          case 2: {
            setActiveCellConditionally();
            setWriteMethod('append');
            setFormulaCellSelectionPoints(cell.formulaEntities);

            break;
          }
          default: {
            break;
          }
        }
      }}
      style={{
        ...CellStyle,
        ...(writeMethod === 'overwrite' ? ActiveCellNoContent : {}),
        ...style,
        // ...(isStyleForSelectingCellsForCellFormulaRange()
        //   ? SelectingCellsForFormulaRangeStyle
        //   : {}),
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
      onMouseUp={() => {
        setIsSelectingCellsForCellFormulaRange(false);
      }}
      onMouseMove={(e) => {
        if (!(e.target instanceof HTMLDivElement)) {
          return;
        }
        // TODO: Don't initiate dragging when mouse didn't moved
        //  from starting cell.
        // TODO: Clean up this code.
        if (
          !isSelectingCellsForFormula &&
          !isSelectingCellsForCellFormulaRange &&
          e.buttons === 1
        ) {
          const targetRow = parseInt(e.target.dataset.row as string, 10);
          const targetColumn = parseInt(e.target.dataset.column as string, 10);

          setCellRangeEnd([targetRow, targetColumn]);
        }

        if (
          !isSelectingCellsForFormula &&
          isSelectingCellsForCellFormulaRange &&
          e.buttons === 1
        ) {
          const targetRow = parseInt(e.target.dataset.row as string, 10);
          const targetColumn = parseInt(e.target.dataset.column as string, 10);

          setCellFormulaDragRangeEnd([targetRow, targetColumn]);
        }
      }}
    >
      {/* TODO: This is kinda hacky, check other way to fixed the double text issue. */}
      <span
        style={{
          color: isCellActive() ? 'transparent' : 'black',
          userSelect: isCellActive() ? 'none' : 'all',
        }}
      >
        {getCellContent()}
      </span>
    </div>
  );
};

export default React.memo(Cell);
