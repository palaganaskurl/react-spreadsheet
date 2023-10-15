import React from 'react';
import './Spreadsheet.css';
import 'react-resizable/css/styles.css';
import Cell from './Cell';
import { useSpreadsheet } from '../state/useSpreadsheet';
import Row from './Row';
import RowContextMenu from './RowContextMenu';
import ColumnContextMenu from './ColumnContextMenu';
import Column from './Column';
import { getCellAddressLabel } from '../lib/spreadsheet';
import CellRangeSelectionOverlay from './CellRangeSelectionOverlay';
import FormulaEditor from './FormulaEditor';
import FormulaCellSelectionOverlay from './FormulaCellSelectionOverlay';
import ActiveCellOverlay from './ActiveCellOverlay';

const ColumnHeadersStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
};
const RowsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};
const ColumnLabelStyle: React.CSSProperties = {
  minWidth: '50px',
  minHeight: '30px',
  backgroundColor: '#f5f5f5',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRight: 'thin solid #e0e0e0',
  borderLeft: 'thin solid #e0e0e0',
  borderBottom: 'thin solid #e0e0e0',
  userSelect: 'none',
  MozUserSelect: 'none',
  KhtmlUserSelect: 'none',
  WebkitUserSelect: 'none',
};
const ColumnFirstLabelStyle: React.CSSProperties = {
  borderTop: 'thin solid #e0e0e0',
};
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
  const rowData = useSpreadsheet((state) => state.data);
  const columns = useSpreadsheet((state) => state.columns);
  const [activeCellRow, activeCellColumn] = useSpreadsheet(
    (state) => state.activeCell
  );
  const cellRangeStart = useSpreadsheet((state) => state.cellRangeStart);
  const cellRangeEnd = useSpreadsheet((state) => state.cellRangeEnd);

  React.useEffect(() => {
    const rehydrate = async () => {
      await useSpreadsheet.persist.rehydrate();
    };

    rehydrate();
  }, []);

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

  return (
    <div className="Spreadsheet">
      <div style={FormulaBarStyle}>
        <div style={FormulaBarActiveCellStyle}>{renderCellAddressLabel()}</div>
        <FormulaEditor />
      </div>
      <div style={ColumnHeadersStyle}>
        <div style={{ ...ColumnLabelStyle, ...ColumnFirstLabelStyle }} />
        {columns.map((columnData, columnIndex) => (
          <Column
            columnData={columnData}
            columnIndex={columnIndex}
            key={`columnHeader${columnData.id}`}
          />
        ))}
      </div>
      <div style={RowsStyle}>
        {rowData.map((row, rowIndex) => (
          <Row key={`row${rowIndex + 1}`} index={rowIndex}>
            {row.map((cell, cellIndex) => (
              <Cell row={rowIndex} column={cellIndex} {...cell} key={cell.id} />
            ))}
          </Row>
        ))}
      </div>
      <RowContextMenu />
      <ColumnContextMenu />
      <CellRangeSelectionOverlay />
      <FormulaCellSelectionOverlay />
      <ActiveCellOverlay />
    </div>
  );
}
