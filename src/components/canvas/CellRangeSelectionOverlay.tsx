import React from 'react';
import { Rect } from 'react-konva';
import { useSpreadsheet } from '../../state/useSpreadsheet';

const CellRangeSelectionOverlay = () => {
  const cellRangeSelection = useSpreadsheet(
    (state) => state.cellRangeSelection
  );

  if (cellRangeSelection === null) {
    return null;
  }

  return (
    <Rect
      x={cellRangeSelection?.left}
      y={cellRangeSelection?.top}
      width={cellRangeSelection?.width}
      height={cellRangeSelection?.height}
      fill="rgb(160 195 255 / 20%)"
      stroke="#0b57d0"
      strokeWidth={1}
    />
  );
};

export default CellRangeSelectionOverlay;
