import React from 'react';
import { useSpreadsheet } from '../state/useSpreadsheet';

const SelectionOverlay = () => {
  // TODO: Selection when backwards not working.
  const cellRangeSelection = useSpreadsheet(
    (state) => state.cellRangeSelection
  );

  return (
    <div
      style={{
        top: `${cellRangeSelection.top}px`,
        left: `${cellRangeSelection.left}px`,
        width: `${cellRangeSelection.width}px`,
        height: `${cellRangeSelection.height}px`,
      }}
      className="Spreadsheet-Selection-Overlay"
    />
  );
};

export default SelectionOverlay;
