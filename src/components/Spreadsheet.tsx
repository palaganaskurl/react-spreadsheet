import React from 'react';
import './Spreadsheet.css';
import { ResizableBox } from 'react-resizable';
import { v4 as uuidv4 } from 'uuid';
import { CellData } from '../types';
import 'react-resizable/css/styles.css';
import Cell from './Cell';
import { useSpreadsheet } from '../state/useSpreadsheet';
import Row from './Row';
import RowContextMenu from './RowContextMenu';

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
        width: DEFAULT_COLUMN_WIDTH,
        height: DEFAULT_ROW_HEIGHT,
        id: uuidv4(),
      });
    }
  }

  const rowData = useSpreadsheet((state) => state.data);
  const setData = useSpreadsheet((state) => state.setData);
  const setColumnWidth = useSpreadsheet((state) => state.setColumnWidth);

  const headers = useSpreadsheet((state) => state.headers);
  const setHeaders = useSpreadsheet((state) => state.setHeaders);

  const [activeCellRow, activeCellColumn] = useSpreadsheet(
    (state) => state.activeCell
  );

  // console.log('Updated row data', rowData);

  React.useEffect(() => {
    setData(initialRowData);
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
        <RowContextMenu />
        {rowData.map((row, rowIndex) => (
          <Row key={`row${rowIndex + 1}`} index={rowIndex}>
            {row.map((cell, cellIndex) => (
              <Cell row={rowIndex} column={cellIndex} {...cell} key={cell.id} />
            ))}
          </Row>
        ))}
      </div>
    </div>
  );
}
