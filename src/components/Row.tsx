import React from 'react';
import { useContextMenu } from 'react-contexify';
import { RowProps } from '../types';
import { RowContextMenuID } from '../constants';

const RowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
};
const RowNumberStyle: React.CSSProperties = {
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

const Row = ({ children, index }: RowProps) => {
  const { show } = useContextMenu({
    id: RowContextMenuID,
  });

  return (
    <div style={RowStyle} key={`row${index + 1}`}>
      <div
        onContextMenu={(e) =>
          show({
            event: e,
            props: {
              rowIndex: index,
            },
          })
        }
        style={RowNumberStyle}
      >
        {index + 1}
      </div>
      {children}
    </div>
  );
};

export default React.memo(Row);
