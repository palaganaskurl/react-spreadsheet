import React from 'react';
import { createPortal } from 'react-dom';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { selectionBorderWidth } from '../constants';
import { getKonvaContainer } from '../lib/dom';

const ActiveCellOverlay = () => {
  // const setCellFormulaDragRangeStart = useSpreadsheet(
  //   (state) => state.setCellFormulaDragRangeStart
  // );
  // const setCellFormulaDragRangeEnd = useSpreadsheet(
  //   (state) => state.setCellFormulaDragRangeEnd
  // );
  // const setIsSelectingCellsForCellFormulaRange = useSpreadsheet(
  //   (state) => state.setIsSelectingCellsForCellFormulaRange
  // );
  const activeCellPosition = useSpreadsheet(
    (state) => state.activeCellPosition
  );
  const isCellEditorFocused = useSpreadsheet(
    (state) => state.isCellEditorFocused
  );

  const konvaJSContainer = getKonvaContainer();

  if (!konvaJSContainer) {
    return null;
  }

  if (activeCellPosition === null) {
    return null;
  }

  const commonStyles: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    userSelect: 'none',
    borderColor: '#0b57d0',
  };

  return createPortal(
    <div
      id="activeCell"
      style={{
        width: `${activeCellPosition.width}px`,
        height: `${activeCellPosition.height}px`,
        top: activeCellPosition.top,
        left: activeCellPosition.left,
        position: 'absolute',
        userSelect: 'none',
        outline: isCellEditorFocused ? '2px solid #a8c7fa' : 'none',
        pointerEvents: 'none',
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
          top: `${activeCellPosition.height - selectionBorderWidth}px`,
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
          left: `${activeCellPosition.width - selectionBorderWidth}px`,
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
          bottom: '0px',
          right: '0px',
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
    </div>,
    konvaJSContainer
  );
};

export default React.memo(ActiveCellOverlay);
