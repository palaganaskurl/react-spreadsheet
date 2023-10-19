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
  const setActiveCell = useSpreadsheet((state) => state.setActiveCell);
  const [activeRow, activeColumn] = useSpreadsheet((state) => state.activeCell);

  const [isEditing, setEditing] = React.useState<boolean>(false);

  const cellRef = React.useRef<HTMLDivElement>(null);

  const getCellContent = () => {
    if (isSelectingCellsForFormula) {
      return (value || '').toString();
    }

    return result?.toString() || (value || '').toString();
  };

  const setCellRangeStart = useSpreadsheet((state) => state.setCellRangeStart);
  const setCellRangeEnd = useSpreadsheet((state) => state.setCellRangeEnd);

  const isSelectingCellsForFormula = useSpreadsheet(
    (state) => state.isSelectingCellsForFormula
  );
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

  return (
    <div
      onKeyDown={() => {}}
      onBlur={() => {
        setEditing(false);
      }}
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
            // setWriteMethod('overwrite');

            break;
          }
          case 2: {
            // cellRef.current!.textContent = value;

            // if (value.startsWith('=')) {
            //   setIsSelectingCellsForFormula(true);
            //   setActiveCell(row, column);
            //   parseFormula(e);
            // }

            setFormulaCellSelectionPoints(formulaEntities);
            // setCellData(row, column, {
            //   value,
            // });
            // setEditing(true);
            setActiveCellConditionally();
            // setWriteMethod('append');

            // if (cellRef.current) {
            //   placeCaretAtEnd(cellRef.current);
            // }

            break;
          }
          default: {
            break;
          }
        }
      }}
      style={{
        ...CellStyle,
        ...(!isEditing ? ActiveCellNoContent : {}),
        ...style,
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
