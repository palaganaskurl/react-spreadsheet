import React from 'react';
import { createPortal } from 'react-dom';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { selectionBorderWidth } from '../constants';

const CellRangeSelectionOverlay = () => {
  const cellRangeSelection = useSpreadsheet(
    (state) => state.cellRangeSelection
  );
  const commonStyles: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
  };
  const borderColor = '#0b57d0';
  const gridContainer = document.querySelector('#gridContainer');

  if (gridContainer === null) {
    return null;
  }

  if (cellRangeSelection === null) {
    return null;
  }

  return createPortal(
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
          top: `${cellRangeSelection.height - selectionBorderWidth}px`,
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
          left: `${cellRangeSelection.width - selectionBorderWidth}px`,
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
    </div>,
    gridContainer
  );
};

export default React.memo(CellRangeSelectionOverlay);
