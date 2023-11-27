import React from 'react';
import { Stage, Layer, KonvaNodeEvents } from 'react-konva';
import './Spreadsheet.css';
import CellComponent from './canvas/CellComponent';
import {
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_ROW_HEIGHT,
  useSpreadsheet,
} from '../state/useSpreadsheet';
import RowNumber from './canvas/RowNumber';
import ColumnHeader from './canvas/ColumnHeader';
import { numberToExcelHeader } from '../lib/spreadsheet';
import ActiveCellOverlay from './ActiveCellOverlay';
import CellEditor from './CellEditor';
import { MaxColumns, MaxRows } from '../constants';
import CellRangeSelectionOverlay from './canvas/CellRangeSelectionOverlay';

const CanvasSpreadsheet = () => {
  const data = useSpreadsheet((state) => state.data);
  const setCanvasStage = useSpreadsheet((state) => state.setCanvasStage);

  const renderColumnHeaders = () => {
    const columnHeaders = [];

    for (let column = 0; column <= MaxColumns; column++) {
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

    for (let row = 0; row <= MaxRows; row++) {
      rowLabels.push(
        <RowNumber x={0} y={row * DEFAULT_ROW_HEIGHT} rowNumber={row} />
      );
    }
    return rowLabels;
  };

  const renderCells = () => {
    const cells = [];

    for (let row = 0; row < data.length; row++) {
      const currentRow = [];

      for (let column = 0; column < data[row].length; column++) {
        const cell = data[row][column];

        currentRow.push(<CellComponent cell={cell} />);
      }

      cells.push(currentRow);
    }

    return cells;
  };

  const setCellRangeStart = useSpreadsheet((state) => state.setCellRangeStart);
  const setCellRangeEnd = useSpreadsheet((state) => state.setCellRangeEnd);

  const onMouseDown: KonvaNodeEvents['onMouseDown'] = (e) => {
    const { dataRow, dataColumn } = e.target.getAttrs();

    setCellRangeEnd(null);
    setCellRangeStart([dataRow, dataColumn]);
  };
  const onMouseMove: KonvaNodeEvents['onMouseMove'] = (e) => {
    if (e.evt.buttons === 1) {
      const { dataRow, dataColumn } = e.target.getAttrs();

      setCellRangeEnd([dataRow, dataColumn]);
    }
  };

  return (
    <>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        ref={(e) => {
          if (e) {
            setCanvasStage(e);
          }
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
      >
        <Layer>
          {renderColumnHeaders()}
          {renderRowLabels()}
          {renderCells()}
          <CellRangeSelectionOverlay />
        </Layer>
      </Stage>
      <ActiveCellOverlay />
      <CellEditor />
    </>
  );
};

export default CanvasSpreadsheet;
