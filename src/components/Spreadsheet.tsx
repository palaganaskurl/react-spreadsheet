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
      <div className="Spreadsheet-Formula-Bar">
        <div className="Spreadsheet-Formula-Bar-Active-Cell">
          {renderCellAddressLabel()}
        </div>
        <FormulaEditor />
      </div>
      <div className="Spreadsheet-Column-Headers">
        <div className="Spreadsheet-Row-Number Spreadsheet-Row-Number-First" />
        {columns.map((columnData, columnIndex) => (
          <Column
            columnData={columnData}
            columnIndex={columnIndex}
            key={`columnHeader${columnData.id}`}
          />
        ))}
      </div>
      <div className="Spreadsheet-Rows">
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
