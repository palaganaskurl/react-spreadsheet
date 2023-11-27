import React from 'react';
import { Rect, KonvaNodeEvents } from 'react-konva';
import {
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_ROW_HEIGHT,
  useSpreadsheet,
} from '../../state/useSpreadsheet';
import { CellStrokeColor, CellStrokeSize } from '../../constants';
import { ActiveCellPosition } from '../../types';

interface CellProps {
  x: number;
  y: number;
  rowNumber: number;
  columnNumber: number;
}

const Cell = ({ x, y, rowNumber, columnNumber }: CellProps) => {
  const setActiveCell = useSpreadsheet((state) => state.setActiveCell);
  const onCellClick: KonvaNodeEvents['onClick'] = (e) => {
    console.log('rowNumber', rowNumber);
    console.log('columnNumber', columnNumber);
    console.log(e.target.getAttrs());
    const rectAttrs = e.target.getAttrs();

    const activeCellPosition: ActiveCellPosition = {
      width: rectAttrs.width,
      height: rectAttrs.height,
      // TODO: Need to know why I have to add 15px
      top: rectAttrs.y + 15,
      left: rectAttrs.x + 15,
    };

    setActiveCell(rowNumber, columnNumber, activeCellPosition);
  };

  return (
    <Rect
      onClick={onCellClick}
      dataRrow={rowNumber}
      dataColumn={columnNumber}
      x={x}
      y={y}
      width={DEFAULT_COLUMN_WIDTH}
      height={DEFAULT_ROW_HEIGHT}
      stroke={CellStrokeColor}
      strokeWidth={CellStrokeSize}
    />
  );
};

export default Cell;
