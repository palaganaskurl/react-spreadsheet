import React from 'react';
import { Rect, Text, Group } from 'react-konva';
import {
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_ROW_HEIGHT,
} from '../../state/useSpreadsheet';
import { CellStrokeColor } from '../../constants';

interface ColumnHeaderProps {
  label: string;
  x: number;
  y: number;
}

const ColumnHeader = ({ x, y, label }: ColumnHeaderProps) => (
  <Group>
    <Rect
      y={y}
      x={x}
      width={DEFAULT_COLUMN_WIDTH}
      height={DEFAULT_ROW_HEIGHT}
      stroke={CellStrokeColor}
      strokeWidth={1}
    />
    <Text
      y={y}
      x={x}
      text={label}
      align="center"
      verticalAlign="middle"
      fontSize={12}
      fill="black"
      height={DEFAULT_ROW_HEIGHT}
      width={DEFAULT_COLUMN_WIDTH}
      padding={5}
    />
  </Group>
);

export default ColumnHeader;
