import React from 'react';
import { ResizableBox } from 'react-resizable';
import { useContextMenu } from 'react-contexify';
import { ColumnProps } from '../types';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { ColumnContextMenuID } from '../constants';
import { numberToExcelHeader } from '../lib/spreadsheet';

const ColumnHeaderStyle: React.CSSProperties = {
  borderBottom: 'thin solid #e0e0e0',
  borderRight: 'thin solid #e0e0e0',
  borderTop: 'thin solid #e0e0e0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  userSelect: 'none',
  MozUserSelect: 'none',
  KhtmlUserSelect: 'none',
  WebkitUserSelect: 'none',
};

const Column = ({ columnData, columnIndex }: ColumnProps) => {
  const { show } = useContextMenu({
    id: ColumnContextMenuID,
  });

  const setHeaders = useSpreadsheet((state) => state.setColumns);
  const setColumnWidth = useSpreadsheet((state) => state.setColumnWidth);
  const headers = useSpreadsheet((state) => state.columns);

  return (
    <div
      style={{
        width: `${columnData.width}px`,
        height: `${columnData.height}px`,
        padding: '4px', // TODO: Add variable for this one
        ...ColumnHeaderStyle,
      }}
      onContextMenu={(e) =>
        show({
          event: e,
          props: {
            columnIndex,
          },
        })
      }
    >
      <ResizableBox
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        height={columnData.height}
        width={columnData.width}
        resizeHandles={['e']}
        // eslint-disable-next-line
        onResize={(event, { node, size, handle }) => {
          // Resize Headers
          const headersCopy = headers.map((inHeader) => {
            if (inHeader.id === columnData.id) {
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
          setColumnWidth(columnIndex, size.width);
        }}
      >
        <span>{numberToExcelHeader(columnIndex + 1)}</span>
      </ResizableBox>
    </div>
  );
};

export default React.memo(Column);
