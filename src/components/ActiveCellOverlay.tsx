import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_ROW_HEIGHT, useSpreadsheet } from '../state/useSpreadsheet';
import { SelectionOverlayStyle } from '../types';
import { selectionBorderWidth } from '../constants';

const ActiveCellOverlay = () => {
  const [activeRow, activeColumn] = useSpreadsheet((state) => state.activeCell);
  const cellElement = document.querySelector<HTMLDivElement>(
    `[data-row="${activeRow}"][data-column="${activeColumn}"]`
  );
  const scrollData = useSpreadsheet((state) => state.scrollData);

  if (!cellElement) {
    return null;
  }

  const getOverlayStyles = (): SelectionOverlayStyle | null => {
    const cellElementBoundingClientRect = cellElement.getBoundingClientRect();

    const top =
      parseInt(cellElement.style.top.replace('px', ''), 10) -
      scrollData.scrollTop;
    const left =
      parseInt(cellElement.style.left.replace('px', ''), 10) -
      scrollData.scrollLeft;

    return {
      borderColor: '#0b57d0',
      width: cellElementBoundingClientRect.width,
      height: cellElementBoundingClientRect.height,
      top: top + DEFAULT_ROW_HEIGHT,
      left,
    };
  };

  const commonStyles: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
  };

  const style = getOverlayStyles();

  commonStyles.borderColor = style?.borderColor;

  if (!style) {
    return null;
  }

  return (
    <div
      id="activeCell"
      style={{
        width: `${style.width}px`,
        height: `${style.height}px`,
        top: `${style.top}px`,
        left: `${style.left}px`,
        position: 'absolute',
        ...commonStyles,
      }}
      key={uuidv4()}
    >
      <div
        style={{
          borderTopWidth: selectionBorderWidth,
          borderTopStyle: 'solid',
          top: '0px',
          width: `${style.width}px`,
          left: '0px',
          ...commonStyles,
        }}
      />
      <div
        style={{
          borderBottomWidth: selectionBorderWidth,
          borderBottomStyle: 'solid',
          top: `${style.height - selectionBorderWidth}px`,
          width: `${style.width}px`,
          left: '0px',
          ...commonStyles,
        }}
      />
      <div
        style={{
          borderRightWidth: selectionBorderWidth,
          borderRightStyle: 'solid',
          top: '0px',
          height: `${style.height}px`,
          left: `${style.width - selectionBorderWidth}px`,
          ...commonStyles,
        }}
      />
      <div
        style={{
          borderLeftWidth: selectionBorderWidth,
          borderLeftStyle: 'solid',
          top: '0px',
          left: '0px',
          height: `${style.height}px`,
          ...commonStyles,
        }}
      />
    </div>
  );
};

export default React.memo(ActiveCellOverlay);
