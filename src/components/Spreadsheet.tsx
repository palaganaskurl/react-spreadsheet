import React from 'react';
import './Spreadsheet.css';
import 'react-resizable/css/styles.css';
import { AutoSizer, GridCellProps, ScrollSync, Grid } from 'react-virtualized';
import scrollbarSize from 'dom-helpers/scrollbarSize';
import Cell from './Cell';
import {
  COLUMN_COUNT,
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_ROW_HEIGHT,
  useSpreadsheet,
} from '../state/useSpreadsheet';
import RowContextMenu from './RowContextMenu';
import ColumnContextMenu from './ColumnContextMenu';
import ColumnLabel from './ColumnLabel';
import { getCellAddressLabel } from '../lib/spreadsheet';
import FormulaEditor from './FormulaEditor';
import FormulaCellSelectionOverlay from './FormulaCellSelectionOverlay';
import ActiveCellOverlay from './ActiveCellOverlay';
import RowLabel from './RowLabel';
import CellFormulaDragOverlay from './CellFormulaDragOverlay';
import CellRangeSelectionOverlay from './CellRangeSelectionOverlay';

const FormulaBarStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  padding: '6px',
};
const FormulaBarActiveCellStyle: React.CSSProperties = {
  width: '10%',
  borderRight: '2px solid gray',
  paddingTop: '2px',
  paddingBottom: '2px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
};

export function Spreadsheet() {
  const spreadsheetData = useSpreadsheet((state) => state.data);
  const [activeCellRow, activeCellColumn] = useSpreadsheet(
    (state) => state.activeCell
  );
  const cellRangeStart = useSpreadsheet((state) => state.cellRangeStart);
  const cellRangeEnd = useSpreadsheet((state) => state.cellRangeEnd);

  const renderCellAddressLabel = () => {
    if (cellRangeStart !== null && cellRangeEnd !== null) {
      const [rowRangeStart, columnRangeStart] = cellRangeStart;
      const [rowRangeEnd, columnRangeEnd] = cellRangeEnd;

      return `${getCellAddressLabel(
        rowRangeStart,
        columnRangeStart
      )}:${getCellAddressLabel(rowRangeEnd, columnRangeEnd)}`;
    }

    return getCellAddressLabel(activeCellRow, activeCellColumn);
  };

  const cellRenderer = ({
    columnIndex,
    key,
    rowIndex,
    style,
  }: GridCellProps) => {
    if (columnIndex < 1) {
      return null;
    }

    const columnIndexMinusOne = columnIndex - 1;
    const cell = spreadsheetData[rowIndex][columnIndexMinusOne];

    return (
      <Cell
        row={rowIndex}
        column={columnIndexMinusOne}
        style={style}
        cell={cell}
        key={key}
      />
    );
  };

  const getColumnWidth = useSpreadsheet((state) => state.getColumnWidth);
  const columnWidths = useSpreadsheet((state) => state.columnWidths);

  const upperRightGridRef = React.useRef<Grid>(null);
  const rowLabelGridRef = React.useRef<Grid>(null);
  const columnLabelGridRef = React.useRef<Grid>(null);
  const cellsGridRef = React.useRef<Grid>(null);

  React.useEffect(() => {
    columnLabelGridRef.current!.recomputeGridSize();
    cellsGridRef.current!.recomputeGridSize();
  }, [columnWidths]);

  const setScrollData = useSpreadsheet((state) => state.setScrollData);

  const height = 300;

  const overscanColumnCount = 0;
  const overscanRowCount = 5;

  const rowLabelRenderer = ({ key, rowIndex, style }: GridCellProps) => (
    <RowLabel key={key} style={style} rowIndex={rowIndex} />
  );

  const renderHeaderCell = ({ columnIndex, key, style }: GridCellProps) => {
    if (columnIndex < 1) {
      return null;
    }

    return <ColumnLabel key={key} style={style} columnIndex={columnIndex} />;
  };

  const renderLeftHeaderCell = ({ key, style }: GridCellProps) => (
    <div
      key={key}
      style={{
        ...style,
        ...{
          backgroundColor: '#f5f5f5',
          border: 'thin solid #e0e0e0',
        },
      }}
    />
  );

  const activeCell = useSpreadsheet((state) => state.activeCell);

  React.useEffect(() => {
    const inputBox = document.querySelector<HTMLDivElement>('#inputBox');

    if (inputBox === null) {
      return;
    }

    inputBox.focus();
  }, [activeCell]);

  return (
    <div className="Spreadsheet">
      <div style={FormulaBarStyle}>
        <div style={FormulaBarActiveCellStyle}>{renderCellAddressLabel()}</div>
        <FormulaEditor />
      </div>
      <div
        style={{
          zIndex: 10,
        }}
      >
        <ScrollSync>
          {({ onScroll, scrollLeft, scrollTop }) => (
            <div
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  flex: '0 0 75px',
                  zIndex: 10,
                }}
              >
                {`Left: ${scrollLeft}, Top: ${scrollTop}`}
                <Grid
                  ref={upperRightGridRef}
                  cellRenderer={renderLeftHeaderCell}
                  width={DEFAULT_COLUMN_WIDTH}
                  height={DEFAULT_ROW_HEIGHT}
                  rowHeight={DEFAULT_ROW_HEIGHT}
                  columnWidth={({ index }) => getColumnWidth(index)}
                  rowCount={1}
                  columnCount={1}
                  style={{
                    overflow: 'hidden',
                    zIndex: 10,
                  }}
                />
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: DEFAULT_ROW_HEIGHT,
                  flex: '0 0 75px',
                  zIndex: 10,
                }}
              >
                <Grid
                  ref={rowLabelGridRef}
                  overscanColumnCount={overscanColumnCount}
                  overscanRowCount={overscanRowCount}
                  cellRenderer={rowLabelRenderer}
                  columnWidth={({ index }) => getColumnWidth(index)}
                  columnCount={1}
                  style={{
                    overflow: 'hidden',
                    zIndex: 10,
                  }}
                  height={height - scrollbarSize()}
                  rowHeight={DEFAULT_ROW_HEIGHT}
                  rowCount={50}
                  scrollTop={scrollTop}
                  width={DEFAULT_COLUMN_WIDTH}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 auto',
                }}
              >
                <AutoSizer disableHeight>
                  {({ width }) => (
                    <div>
                      <div
                        style={{
                          height: DEFAULT_ROW_HEIGHT,
                          width: width - scrollbarSize(),
                        }}
                      >
                        <Grid
                          ref={columnLabelGridRef}
                          style={{
                            width: '100%',
                            overflow: 'hidden',
                            zIndex: 10,
                          }}
                          columnWidth={({ index }) => getColumnWidth(index)}
                          columnCount={COLUMN_COUNT}
                          height={height}
                          overscanColumnCount={overscanColumnCount}
                          cellRenderer={renderHeaderCell}
                          rowHeight={DEFAULT_ROW_HEIGHT}
                          rowCount={1}
                          scrollLeft={scrollLeft}
                          width={width - scrollbarSize()}
                        />
                      </div>
                      <div
                        style={{
                          height,
                          width,
                        }}
                      >
                        <Grid
                          id="gridContainer"
                          ref={cellsGridRef}
                          cellRenderer={cellRenderer}
                          columnWidth={({ index }) => getColumnWidth(index)}
                          columnCount={COLUMN_COUNT}
                          height={height}
                          rowHeight={DEFAULT_ROW_HEIGHT}
                          rowCount={spreadsheetData.length}
                          width={width}
                          onScroll={(params) => {
                            onScroll(params);

                            setScrollData({
                              scrollTop: params.scrollTop,
                              scrollLeft: params.scrollLeft,
                            });
                          }}
                          style={{
                            width: '100%',
                            zIndex: 10,
                          }}
                        />
                        <CellFormulaDragOverlay />
                      </div>
                    </div>
                  )}
                </AutoSizer>
                <ActiveCellOverlay />
              </div>
            </div>
          )}
        </ScrollSync>
      </div>
      <RowContextMenu />
      <ColumnContextMenu />
      <CellRangeSelectionOverlay />
      <FormulaCellSelectionOverlay />
    </div>
  );
}
