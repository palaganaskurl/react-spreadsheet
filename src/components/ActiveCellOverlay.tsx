import React from 'react';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { OverlayZIndex, selectionBorderWidth } from '../constants';

const ActiveCellOverlay = () => {
  const [activeRow, activeColumn] = useSpreadsheet((state) => state.activeCell);
  const setCellFormulaDragRangeStart = useSpreadsheet(
    (state) => state.setCellFormulaDragRangeStart
  );
  const setCellFormulaDragRangeEnd = useSpreadsheet(
    (state) => state.setCellFormulaDragRangeEnd
  );
  const setIsSelectingCellsForCellFormulaRange = useSpreadsheet(
    (state) => state.setIsSelectingCellsForCellFormulaRange
  );
  const activeCellPosition = useSpreadsheet(
    (state) => state.activeCellPosition
  );

  if (activeCellPosition === null) {
    return null;
  }

  const commonStyles: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: OverlayZIndex,
    borderColor: '#0b57d0',
  };

  return (
    <div
      id="activeCell"
      style={{
        width: `${activeCellPosition.width}px`,
        height: `${activeCellPosition.height}px`,
        top: activeCellPosition.top,
        left: activeCellPosition.left,
        position: 'absolute',
        // pointerEvents: 'none',
        userSelect: 'none',
        zIndex: OverlayZIndex,
      }}
    >
      <div
        style={{
          borderTopWidth: selectionBorderWidth,
          borderTopStyle: 'solid',
          top: '0px',
          width: `${activeCellPosition.width}px`,
          left: '0px',
          ...commonStyles,
        }}
      />
      <div
        style={{
          borderBottomWidth: selectionBorderWidth,
          borderBottomStyle: 'solid',
          top: `${activeCellPosition.height}px`,
          width: `${activeCellPosition.width}px`,
          left: '0px',
          ...commonStyles,
        }}
      />
      <div
        style={{
          borderRightWidth: selectionBorderWidth,
          borderRightStyle: 'solid',
          top: '0px',
          height: `${activeCellPosition.height}px`,
          left: `${activeCellPosition.width}px`,
          ...commonStyles,
        }}
      />
      <div
        style={{
          borderLeftWidth: selectionBorderWidth,
          borderLeftStyle: 'solid',
          top: '0px',
          left: '0px',
          height: `${activeCellPosition.height}px`,
          ...commonStyles,
        }}
      />
      <div
        style={{
          cursor: 'crosshair',
          backgroundColor: '#0b57d0',
          width: '6px',
          height: '6px',
          bottom: '-4px',
          right: '-4px',
          position: 'absolute',
          pointerEvents: 'all',
        }}
        tabIndex={0}
        aria-label="Active Cell Overlay"
        role="button"
        onMouseDown={() => {
          // setCellFormulaDragRangeEnd(null);
          // setCellFormulaDragRangeStart([activeRow, activeColumn]);
          // setIsSelectingCellsForCellFormulaRange(true);
        }}
      />
    </div>
  );
};

export default ActiveCellOverlay;
