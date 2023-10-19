import React from 'react';
import { ResizableBox } from 'react-resizable';
import { useContextMenu } from 'react-contexify';
import { ColumnProps } from '../types';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { ColumnContextMenuID } from '../constants';
import { numberToExcelHeader } from '../lib/spreadsheet';

const ColumnHeaderStyle: React.CSSProperties = {
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
  borderTop: 'thin solid #e0e0e0',
};

const ColumnLabel = ({ columnIndex, style }: ColumnProps) => {
  const { show } = useContextMenu({
    id: ColumnContextMenuID,
  });

  const setColumnWidth = useSpreadsheet((state) => state.setColumnWidth);

  return (
    <ResizableBox
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
        ...ColumnHeaderStyle,
      }}
      height={style.height as number}
      width={style.width as number}
      resizeHandles={['e']}
      // eslint-disable-next-line
      onResizeStop={(event, { size }) => {
        setColumnWidth(columnIndex, size.width);
      }}
    >
      <div
        onContextMenu={(e) =>
          show({
            event: e,
            props: {
              columnIndex,
            },
          })
        }
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {numberToExcelHeader(columnIndex)}
      </div>
    </ResizableBox>
  );
};

export default React.memo(ColumnLabel);
