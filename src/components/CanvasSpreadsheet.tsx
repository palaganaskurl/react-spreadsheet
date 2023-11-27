import React from 'react';
import { Stage, Layer, Rect, Circle, KonvaNodeEvents } from 'react-konva';
import Cell from './canvas/Cell';
import {
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_ROW_HEIGHT,
} from '../state/useSpreadsheet';
import RowNumber from './canvas/RowNumber';
import ColumnHeader from './canvas/ColumnHeader';
import { numberToExcelHeader } from '../lib/spreadsheet';
import ActiveCellOverlay from './ActiveCellOverlay';
import { CellProps } from '../types';

const CanvasSpreadsheet = () => {
  const MAX_COLUMNS = 30;
  const MAX_ROWS = 50;

  const renderColumnHeaders = () => {
    const columnHeaders = [];

    for (let column = 0; column <= MAX_COLUMNS; column++) {
      columnHeaders.push(
        <ColumnHeader
          x={column * DEFAULT_COLUMN_WIDTH}
          y={0}
          label={numberToExcelHeader(columnHeaders.length)}
        />
      );
    }

    return columnHeaders;
  };

  const renderRowLabels = () => {
    const rowLabels = [];

    for (let row = 0; row <= MAX_ROWS; row++) {
      rowLabels.push(
        <RowNumber x={0} y={row * DEFAULT_ROW_HEIGHT} rowNumber={row} />
      );
    }
    return rowLabels;
  };

  const renderCells = () => {
    // TODO: Prefill this with arrays
    const cells = [];

    for (let row = 1; row < MAX_ROWS; row++) {
      cells.push([]);

      for (let column = 1; column < MAX_COLUMNS; column++) {
        cells[row - 1].push(
          <Cell
            x={row * DEFAULT_COLUMN_WIDTH}
            y={column * DEFAULT_ROW_HEIGHT}
            rowNumber={row - 1}
            columnNumber={column - 1}
          />
        );
      }
    }

    return cells;
  };

  const onCellClick: KonvaNodeEvents['onClick'] = (e) => {
    console.log(e.target.getAttrs());
  };

  return (
    <>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        // onClick={onCellClick}
      >
        <Layer>
          {renderColumnHeaders()}
          {renderRowLabels()}
          {renderCells()}
        </Layer>
      </Stage>
      <ActiveCellOverlay />
    </>
  );
};

export default CanvasSpreadsheet;
