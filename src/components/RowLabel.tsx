import React from 'react';
import { useContextMenu } from 'react-contexify';
import { RowProps } from '../types';
import { RowContextMenuID } from '../constants';

const RowNumberStyle: React.CSSProperties = {
  backgroundColor: '#f5f5f5',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRight: 'thin solid #e0e0e0',
  borderLeft: 'thin solid #e0e0e0',
  borderBottom: 'thin solid #e0e0e0',
  borderTop: 'thin solid #e0e0e0',
  userSelect: 'none',
  MozUserSelect: 'none',
  KhtmlUserSelect: 'none',
  WebkitUserSelect: 'none',
};

const RowLabel = ({ rowIndex, style }: RowProps) => {
  const { show } = useContextMenu({
    id: RowContextMenuID,
  });

  const rowIndexPlusOne = rowIndex + 1;

  return (
    <div
      style={{ ...style, ...RowNumberStyle }}
      key={`row${rowIndexPlusOne}`}
      onContextMenu={(e) =>
        show({
          event: e,
          props: {
            rowIndexPlusOne,
          },
        })
      }
    >
      {rowIndexPlusOne}
    </div>
  );
};

export default React.memo(RowLabel);
