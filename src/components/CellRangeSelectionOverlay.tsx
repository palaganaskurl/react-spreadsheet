import React from 'react';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { selectionBorderWidth } from '../constants';

const CellRangeSelectionOverlay = () => {
  const cellRangeSelection = useSpreadsheet(
    (state) => state.cellRangeSelection
  );
  const commonStyles: React.CSSProperties = {
    position: 'absolute',
    userSelect: 'none',
    pointerEvents: 'none',
    zIndex: 20,
  };
  const borderColor = '#0b57d0';

  if (cellRangeSelection === null) {
    return null;
  }

  return (
    <div
      id="selectionRangeOverlay"
      style={{
        top: `${cellRangeSelection.top}px`,
        left: `${cellRangeSelection.left}px`,
        width: `${cellRangeSelection.width}px`,
        height: `${cellRangeSelection.height}px`,
        backgroundColor: 'rgb(160 195 255 / 20%)',
        ...commonStyles,
      }}
    >
      <div
        style={{
          borderTopWidth: selectionBorderWidth,
          borderTopColor: borderColor,
          borderTopStyle: 'solid',
          top: '0px',
          width: `${cellRangeSelection.width}px`,
          left: '0px',
          ...commonStyles,
        }}
      />
      <div
        style={{
          borderBottomWidth: selectionBorderWidth,
          borderBottomColor: borderColor,
          borderBottomStyle: 'solid',
          top: `${cellRangeSelection.height - 4}px`,
          width: `${cellRangeSelection.width}px`,
          left: '0px',
          ...commonStyles,
        }}
      />
      <div
        style={{
          borderRightWidth: selectionBorderWidth,
          borderRightColor: borderColor,
          borderRightStyle: 'solid',
          top: '0px',
          height: `${cellRangeSelection.height}px`,
          left: `${cellRangeSelection.width - 4}px`,
          ...commonStyles,
        }}
      />
      <div
        style={{
          borderLeftWidth: selectionBorderWidth,
          borderLeftColor: borderColor,
          borderLeftStyle: 'solid',
          top: '0px',
          left: '0px',
          height: `${cellRangeSelection.height}px`,
          ...commonStyles,
        }}
      />
    </div>
  );
};

export default React.memo(CellRangeSelectionOverlay);
