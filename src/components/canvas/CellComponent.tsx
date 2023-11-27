import React from 'react';
import { Rect, KonvaNodeEvents, Text, Group } from 'react-konva';
import {
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_ROW_HEIGHT,
  useSpreadsheet,
} from '../../state/useSpreadsheet';
import { CellStrokeColor, CellStrokeSize } from '../../constants';
import { ActiveCellPosition } from '../../types';
import Cell from '../../lib/cell';

const CellComponent = ({ cell }: { cell: Cell }) => {
  const setActiveCell = useSpreadsheet((state) => state.setActiveCell);
  const setIsCellEditorFocused = useSpreadsheet(
    (state) => state.setIsCellEditorFocused
  );
  const isSelectingCellsForFormula = useSpreadsheet(
    (state) => state.isSelectingCellsForFormula
  );
  const onCellClick: KonvaNodeEvents['onClick'] = (e) => {
    setIsCellEditorFocused(false);

    const rectAttrs = e.target.getAttrs();

    const activeCellPosition: ActiveCellPosition = {
      width: rectAttrs.width,
      height: rectAttrs.height,
      top: rectAttrs.y,
      left: rectAttrs.x,
    };

    setActiveCell(cell.row, cell.column, activeCellPosition);
  };
  const onCellDoubleClick: KonvaNodeEvents['onDblClick'] = () => {
    setIsCellEditorFocused(true);
  };
  const getCellContent = React.useCallback(() => {
    if (isSelectingCellsForFormula) {
      return cell.value;
    }

    if (typeof cell.result === 'object') {
      // @ts-expect-error
      // eslint-disable-next-line
      return result._error;
    }

    return cell.result?.toString() || cell.value;
  }, [cell, isSelectingCellsForFormula]);

  return (
    <Group
      onClick={onCellClick}
      onDblClick={onCellDoubleClick}
      onMouseDown={onCellClick}
    >
      {/* Note: Whichever is on the bottom, it's the one that is clicked. */}
      <Text
        y={cell.y}
        x={cell.x}
        text={getCellContent()}
        align="center"
        verticalAlign="middle"
        fontSize={12}
        fill="black"
        height={DEFAULT_ROW_HEIGHT}
        width={DEFAULT_COLUMN_WIDTH}
        padding={5}
      />
      <Rect
        id={`cell-${cell.row}-${cell.column}`}
        dataRow={cell.row}
        dataColumn={cell.column}
        x={cell.x}
        y={cell.y}
        width={DEFAULT_COLUMN_WIDTH}
        height={DEFAULT_ROW_HEIGHT}
        stroke={CellStrokeColor}
        strokeWidth={CellStrokeSize}
      />
    </Group>
  );
};

export default React.memo(CellComponent);
