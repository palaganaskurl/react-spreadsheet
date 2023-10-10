import React from 'react';
import './Spreadsheet.css';
import { v4 as uuidv4 } from 'uuid';
import { CellData } from '../types';
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
  const DEFAULT_COLUMN_WIDTH = 50;
  const DEFAULT_ROW_HEIGHT = 30;

  const ROW_COUNT = 20;
  const COLUMN_COUNT = 20;

  const initialRowData: Array<CellData[]> = [];

  for (let i = 0; i < ROW_COUNT; i++) {
    initialRowData.push([]);

    for (let j = 0; j < COLUMN_COUNT; j++) {
      initialRowData[i].push({
        width: DEFAULT_COLUMN_WIDTH,
        height: DEFAULT_ROW_HEIGHT,
        id: uuidv4(),
        value: '',
        formulaEntities: new Set(),
      });
    }
  }

  const rowData = useSpreadsheet((state) => state.data);
  const setData = useSpreadsheet((state) => state.setData);

  const columns = useSpreadsheet((state) => state.columns);

  const [activeCellRow, activeCellColumn] = useSpreadsheet(
    (state) => state.activeCell
  );
  const cellRangeStart = useSpreadsheet((state) => state.cellRangeStart);
  const cellRangeEnd = useSpreadsheet((state) => state.cellRangeEnd);

  React.useEffect(() => {
    setData(initialRowData);
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
