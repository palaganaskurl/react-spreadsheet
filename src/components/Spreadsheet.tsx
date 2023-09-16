import React from 'react';
import './Spreadsheet.css';
import { ResizableBox } from 'react-resizable';
import { CellData } from '../types';
import 'react-resizable/css/styles.css';
import Cell from './Cell';
import { useSpreadsheet } from '../state/useSpreadsheet';

export function Spreadsheet() {
  const DEFAULT_COLUMN_WIDTH = 50;
  const DEFAULT_ROW_HEIGHT = 30;

  const ROW_COUNT = 10;
  const COLUMN_COUNT = 10;

  const initialRowData: Array<CellData[]> = [];

  for (let i = 0; i < ROW_COUNT; i++) {
    initialRowData.push([]);

    for (let j = 0; j < COLUMN_COUNT; j++) {
      initialRowData[i].push({
        row: i,
        column: j,
        width: DEFAULT_COLUMN_WIDTH,
        height: DEFAULT_ROW_HEIGHT,
      });
    }
  }

  const rowData = useSpreadsheet((state) => state.data);
  const setInitialData = useSpreadsheet((state) => state.setInitialData);
  const setColumnWidth = useSpreadsheet((state) => state.setColumnWidth);

  const headers = useSpreadsheet((state) => state.headers);
  const setHeaders = useSpreadsheet((state) => state.setHeaders);

  const [activeCellRow, activeCellColumn] = useSpreadsheet(
    (state) => state.activeCell
  );

  React.useEffect(() => {
    setInitialData(initialRowData);
  }, []);

  return (
    <div className="Spreadsheet">
      <div className="Spreadsheet-Formula-Bar">
        <div className="Spreadsheet-Formula-Bar-Active-Cell">
          {headers[activeCellColumn].label}
          {activeCellRow + 1}
        </div>
        <div className="Spreadsheet-Formula">
          fx
          <input type="text" />
        </div>
      </div>
      <div className="Spreadsheet-Column-Headers">
        <div className="Spreadsheet-Row-Number Spreadsheet-Row-Number-First" />
        {headers.map((header) => (
          <div
            className="Spreadsheet-Column-Header"
            key={`columnHeader${header.label}`}
            style={{
              width: `${header.width}px`,
              height: `${header.height}px`,
              padding: '4px', // TODO: Add variable for this one
            }}
          >
            <ResizableBox
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              height={header.height}
              width={header.width}
              resizeHandles={['e']}
              // eslint-disable-next-line
              onResize={(event, { node, size, handle }) => {
                // Resize Headers
                const headersCopy = headers.map((inHeader) => {
                  if (inHeader.label === header.label) {
                    return {
                      ...inHeader,
                      ...{
                        height: size.height,
                        width: size.width,
                      },
                    };
                  }

                  return inHeader;
                });

                setHeaders(headersCopy);
                setColumnWidth(header.index, size.width);
              }}
            >
              <span>{header.label}</span>
            </ResizableBox>
          </div>
        ))}
      </div>
      <div className="Spreadsheet-Rows">
        {rowData.map((row, rowIndex) => (
          <div className="Spreadsheet-Row" key={`row${rowIndex + 1}`}>
            <div className="Spreadsheet-Row-Number">{rowIndex + 1}</div>
            {row.map((cell) => (
              <Cell {...cell} key={`cell${cell.row}${cell.column}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
