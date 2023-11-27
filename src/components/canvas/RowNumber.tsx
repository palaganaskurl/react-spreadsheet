import React from 'react';
import { Rect, Text, Group } from 'react-konva';
import {
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_ROW_HEIGHT,
} from '../../state/useSpreadsheet';
import { CellStrokeColor, CellStrokeSize } from '../../constants';

interface RowNumberProps {
  rowNumber: number;
  x: number;
  y: number;
}

const RowNumber = ({ x, y, rowNumber }: RowNumberProps) => (
  <Group>
    <Rect
      y={y}
      x={x}
      width={DEFAULT_COLUMN_WIDTH}
      height={DEFAULT_ROW_HEIGHT}
      stroke={CellStrokeColor}
      strokeWidth={CellStrokeSize}
    />
    <Text
      y={y}
      x={x}
      text={rowNumber}
      align="center"
      verticalAlign="middle"
      fontSize={12}
      fill="black"
      height={DEFAULT_ROW_HEIGHT}
      width={DEFAULT_COLUMN_WIDTH}
    />
  </Group>
);

export default RowNumber;
