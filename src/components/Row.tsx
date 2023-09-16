import React from 'react';
import { useContextMenu } from 'react-contexify';
import { RowProps } from '../types';

const Row = ({ children, index }: RowProps) => {
  const MENU_ID = 'RowContextMenu';
  const { show } = useContextMenu({
    id: MENU_ID,
  });

  return (
    <div className="Spreadsheet-Row" key={`row${index + 1}`}>
      <div
        onContextMenu={(e) =>
          show({
            event: e,
            props: {
              rowIndex: index,
            },
          })
        }
        className="Spreadsheet-Row-Number"
      >
        {index + 1}
      </div>
      {children}
    </div>
  );
};

export default React.memo(Row);
