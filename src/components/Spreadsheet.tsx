import React from 'react';
import './Spreadsheet.css';
import 'react-resizable/css/styles.css';
import { MultiGrid, AutoSizer, GridCellProps } from 'react-virtualized';
import Cell from './Cell';
import {
  COLUMN_COUNT,
  DEFAULT_ROW_HEIGHT,
  useSpreadsheet,
} from '../state/useSpreadsheet';
import RowContextMenu from './RowContextMenu';
import ColumnContextMenu from './ColumnContextMenu';
import ColumnLabel from './ColumnLabel';
import { getCellAddressLabel } from '../lib/spreadsheet';
import CellRangeSelectionOverlay from './CellRangeSelectionOverlay';
import FormulaEditor from './FormulaEditor';
import FormulaCellSelectionOverlay from './FormulaCellSelectionOverlay';
import ActiveCellOverlay from './ActiveCellOverlay';
import RowLabel from './RowLabel';

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

  // React.useEffect(() => {
  //   const rehydrate = async () => {
  //     await useSpreadsheet.persist.rehydrate();
  //   };

  //   // rehydrate();
  // }, []);

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
    if (rowIndex === 0 && columnIndex === 0) {
      return <div style={style} key={key} />;
    }

    if (rowIndex === 0) {
      return <ColumnLabel key={key} style={style} columnIndex={columnIndex} />;
    }

    if (columnIndex === 0) {
      return <RowLabel key={key} style={style} rowIndex={rowIndex} />;
    }

    const cell = spreadsheetData[rowIndex][columnIndex];

    return (
      <Cell
        row={rowIndex}
        column={columnIndex}
        style={style}
        {...cell}
        key={key}
      />
    );
  };

  const getColumnWidth = useSpreadsheet((state) => state.getColumnWidth);
  const columnWidths = useSpreadsheet((state) => state.columnWidths);

  React.useEffect(() => {
    gridRef.current!.recomputeGridSize();
  }, [columnWidths]);

  const gridRef = React.useRef<MultiGrid>(null);

  return (
    <div className="Spreadsheet">
      <div style={FormulaBarStyle}>
        <div style={FormulaBarActiveCellStyle}>{renderCellAddressLabel()}</div>
        <FormulaEditor />
      </div>
      <div style={{ height: '70vh' }}>
        <AutoSizer>
          {({ width, height }: { height: number; width: number }) => (
            <MultiGrid
              ref={gridRef}
              cellRenderer={cellRenderer}
              columnWidth={({ index }) => getColumnWidth(index)}
              columnCount={COLUMN_COUNT}
              fixedColumnCount={1}
              fixedRowCount={1}
              height={height}
              rowHeight={DEFAULT_ROW_HEIGHT}
              rowCount={spreadsheetData.length}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
      <RowContextMenu />
      <ColumnContextMenu />
      <CellRangeSelectionOverlay />
      <FormulaCellSelectionOverlay />
      <ActiveCellOverlay />
    </div>
  );
}
