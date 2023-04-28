import React from 'react';
import './Spreadsheet.css';

export function Spreadsheet() {
  const COLUMN_HEADERS = ['A', 'B', 'C'];

  return (
    <div>
      <div className="Spreadsheet-Column-Header">
        {COLUMN_HEADERS.map((header) => (
          <div>{header}</div>
        ))}
      </div>
    </div>
  );
}
