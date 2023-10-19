import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createPortal } from 'react-dom';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { SelectionOverlayStyle } from '../types';
import { selectionBorderWidth } from '../constants';
import { getCellContainer, getGridContainer } from '../lib/dom';
import CellEditor from './CellEditor';

const ActiveCellOverlay = () => {
  const [activeRow, activeColumn] = useSpreadsheet((state) => state.activeCell);
  const cellElement = getCellContainer(activeRow, activeColumn);
  const scrollData = useSpreadsheet((state) => state.scrollData);

  if (!cellElement) {
    return null;
  }

  const getOverlayStyles = (): SelectionOverlayStyle | null => {
    const cellElementBoundingClientRect = cellElement.getBoundingClientRect();
    const gridContainerBoundingRect =
      getGridContainer().getBoundingClientRect();

    const top =
      cellElementBoundingClientRect.top -
      gridContainerBoundingRect.top -
      scrollData.scrollTop;
    const left =
      cellElementBoundingClientRect.left -
      gridContainerBoundingRect.left -
      scrollData.scrollLeft;

    return {
      borderColor: '#0b57d0',
      width: cellElementBoundingClientRect.width,
      height: cellElementBoundingClientRect.height,
      top,
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

  return createPortal(
    <div
      id="activeCell"
      style={{
        width: `${style.width}px`,
        height: `${style.height}px`,
        // top: `${style.top}px`,
        // left: `${style.left}px`,
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
      <CellEditor />
    </div>,
    cellElement
  );
};

export default ActiveCellOverlay;
