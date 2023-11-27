import React from 'react';
import { createPortal } from 'react-dom';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { selectionBorderWidth } from '../constants';
import { getCellContainer, getGridContainer } from '../lib/dom';

const CellFormulaDragOverlay = () => {
  const cellFormulaDragRangeSelection = useSpreadsheet(
    (state) => state.cellFormulaDragRangeSelection
  );
  const commonStyles: React.CSSProperties = {
    position: 'absolute',
    // pointerEvents: 'none',
  };
  const borderColor = 'gray';
  const [activeRow, activeColumn] = useSpreadsheet((state) => state.activeCell);
  const cellElement = getCellContainer(activeRow, activeColumn);
  const gridContainer = getGridContainer();

  if (
    gridContainer === null ||
    !cellElement ||
    cellFormulaDragRangeSelection === null
  ) {
    return null;
  }

  return createPortal(
    <div
      id="cellFormulaDragOverlay"
      style={{
        top: `${cellFormulaDragRangeSelection.top}px`,
        left: `${cellFormulaDragRangeSelection.left}px`,
        width: `${cellFormulaDragRangeSelection.width}px`,
        height: `${cellFormulaDragRangeSelection.height}px`,
        ...commonStyles,
      }}
    >
      {cellFormulaDragRangeSelection.direction !== 'bottom' && (
        <div
          style={{
            borderTopWidth: selectionBorderWidth,
            borderTopColor: borderColor,
            borderTopStyle: 'dashed',
            top: '0px',
            width: `${cellFormulaDragRangeSelection.width}px`,
            left: '0px',
            ...commonStyles,
          }}
        />
      )}
      {cellFormulaDragRangeSelection.direction !== 'top' && (
        <div
          style={{
            borderBottomWidth: selectionBorderWidth,
            borderBottomColor: borderColor,
            borderBottomStyle: 'dashed',
            top: `${
              cellFormulaDragRangeSelection.height - selectionBorderWidth
            }px`,
            width: `${cellFormulaDragRangeSelection.width}px`,
            left: '0px',
            ...commonStyles,
          }}
        />
      )}
      {cellFormulaDragRangeSelection.direction !== 'left' && (
        <div
          style={{
            borderRightWidth: selectionBorderWidth,
            borderRightColor: borderColor,
            borderRightStyle: 'dashed',
            top: '0px',
            height: `${cellFormulaDragRangeSelection.height}px`,
            left: `${
              cellFormulaDragRangeSelection.width - selectionBorderWidth
            }px`,
            ...commonStyles,
          }}
        />
      )}
      {cellFormulaDragRangeSelection.direction !== 'right' && (
        <div
          style={{
            borderLeftWidth: selectionBorderWidth,
            borderLeftColor: borderColor,
            borderLeftStyle: 'dashed',
            top: '0px',
            left: '0px',
            height: `${cellFormulaDragRangeSelection.height}px`,
            ...commonStyles,
          }}
        />
      )}
    </div>,
    gridContainer
  );
};

export default React.memo(CellFormulaDragOverlay);
