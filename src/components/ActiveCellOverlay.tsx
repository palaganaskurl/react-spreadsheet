import React from 'react';
import { createPortal } from 'react-dom';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { SelectionOverlayStyle } from '../types';
import { selectionBorderWidth } from '../constants';
import { getCellContainer, getNumberFromPXString } from '../lib/dom';

const ActiveCellOverlay = () => {
  const [activeRow, activeColumn] = useSpreadsheet((state) => state.activeCell);
  const cellElement = getCellContainer(activeRow, activeColumn);
  const setCellFormulaDragRangeStart = useSpreadsheet(
    (state) => state.setCellFormulaDragRangeStart
  );
  const setCellFormulaDragRangeEnd = useSpreadsheet(
    (state) => state.setCellFormulaDragRangeEnd
  );
  const setIsSelectingCellsForCellFormulaRange = useSpreadsheet(
    (state) => state.setIsSelectingCellsForCellFormulaRange
  );
  const gridContainer = document.querySelector('#gridContainer');

  if (gridContainer === null) {
    return null;
  }

  if (!cellElement) {
    return null;
  }

  const getOverlayStyles = (): SelectionOverlayStyle | null => {
    const cellElementBoundingClientRect = cellElement.getBoundingClientRect();

    return {
      borderColor: '#0b57d0',
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

  return createPortal(
    <div
      id="activeCell"
      style={{
        width: `${style.width}px`,
        height: `${style.height}px`,
        top: `${getNumberFromPXString(cellElement.style.top)}px`,
        left: `${getNumberFromPXString(cellElement.style.left)}px`,
        position: 'absolute',
        pointerEvents: 'none',
      }}
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
      <div
        style={{
          cursor: 'crosshair',
          backgroundColor: '#0b57d0',
          width: '6px',
          height: '6px',
          bottom: '-2px',
          right: '-2px',
          position: 'absolute',
          zIndex: 20,
          pointerEvents: 'all',
        }}
        tabIndex={0}
        aria-label="Active Cell Overlay"
        role="button"
        onMouseDown={() => {
          setCellFormulaDragRangeEnd(null);
          setCellFormulaDragRangeStart([activeRow, activeColumn]);
          setIsSelectingCellsForCellFormulaRange(true);
        }}
      />
    </div>,
    gridContainer
  );
};

export default React.memo(ActiveCellOverlay);
