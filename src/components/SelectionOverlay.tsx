import React from 'react';
import classNames from 'classnames';
import { useSpreadsheet } from '../state/useSpreadsheet';

const SelectionOverlay = () => {
  // TODO: Selection when backwards not working.
  // TODO: Try implementing this also on one selected cell
  const cellRangeSelection = useSpreadsheet(
    (state) => state.cellRangeSelection
  );
  const isDraggingCellRange = useSpreadsheet(
    (state) => state.isDraggingCellRange
  );

  return (
    <div
      style={{
        top: `${cellRangeSelection.top}px`,
        left: `${cellRangeSelection.left}px`,
        width: `${cellRangeSelection.width}px`,
        height: `${cellRangeSelection.height}px`,
      }}
      className={classNames({
        'Spreadsheet-Selection-Overlay': true,
        'Spreadsheet-Selection-Overlay-After': !isDraggingCellRange,
      })}
    />
  );
};

export default SelectionOverlay;
