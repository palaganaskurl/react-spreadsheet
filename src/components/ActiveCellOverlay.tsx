import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { SelectionOverlayStyle } from '../types';
import { selectionBorderWidth } from '../constants';

const ActiveCellOverlay = () => {
  const activeCell = useSpreadsheet((state) => state.activeCell);

  const getOverlayStyles = (): SelectionOverlayStyle | null => {
    const [row, column] = activeCell;
    const cellElement = document.querySelector(
      `[data-row="${row}"][data-column="${column}"]`
    );

    if (!cellElement) {
      return null;
    }

    const cellElementBoundingClientRect = cellElement?.getBoundingClientRect();

    return {
      borderColor: '#0b57d0',
      top: cellElementBoundingClientRect.top + window.scrollY,
      left: cellElementBoundingClientRect.left + window.scrollX,
      width: cellElementBoundingClientRect.width,
      height: cellElementBoundingClientRect.height,
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

  // TODO: Fix some values here used in subtractions to
  //  have more context in future changes.
  return (
    <div
      id="activeCell"
      style={{
        top: `${style.top}px`,
        left: `${style.left}px`,
        width: `${style.width}px`,
        height: `${style.height}px`,
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
          top: `${style.height - 4}px`,
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
          left: `${style.width - 4}px`,
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
