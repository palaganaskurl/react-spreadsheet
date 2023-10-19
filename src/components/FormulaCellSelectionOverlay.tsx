import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createPortal } from 'react-dom';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { selectionBorderWidth } from '../constants';
import { getCellContainer } from '../lib/dom';

const FormulaCellSelectionOverlay = () => {
  const formulaCellSelections = useSpreadsheet(
    (state) => state.formulaCellSelections
  );

  if (formulaCellSelections.length === 0) {
    return null;
  }

  const commonStyles: React.CSSProperties = {
    position: 'absolute',
    userSelect: 'none',
  };

  return (
    <>
      {formulaCellSelections.map((selection) => {
        const [row, column] = selection.point;
        const cellElement = getCellContainer(row, column);

        if (cellElement === null) {
          return null;
        }

        const cellElementBoundingClientRect =
          cellElement?.getBoundingClientRect();

        const style = {
          borderColor: selection.borderColor,
          width: cellElementBoundingClientRect.width,
          height: cellElementBoundingClientRect.height,
        };
        const borderColor = `#${style.borderColor}`;

        return createPortal(
          <div
            style={{
              width: `${style.width}px`,
              height: `${style.height}px`,
              position: 'absolute',
            }}
            key={uuidv4()}
          >
            <div
              style={{
                borderTopWidth: selectionBorderWidth,
                borderTopColor: borderColor,
                borderTopStyle: 'dashed',
                top: '0px',
                width: `${style.width}px`,
                left: '0px',
                ...commonStyles,
              }}
            />
            <div
              style={{
                borderBottomWidth: selectionBorderWidth,
                borderBottomColor: borderColor,
                borderBottomStyle: 'dashed',
                top: `${style.height - selectionBorderWidth}px`,
                width: `${style.width}px`,
                left: '0px',
                ...commonStyles,
              }}
            />
            <div
              style={{
                borderRightWidth: selectionBorderWidth,
                borderRightColor: borderColor,
                borderRightStyle: 'dashed',
                top: '0px',
                height: `${style.height}px`,
                left: `${style.width - selectionBorderWidth}px`,
                ...commonStyles,
              }}
            />
            <div
              style={{
                borderLeftWidth: selectionBorderWidth,
                borderLeftColor: borderColor,
                borderLeftStyle: 'dashed',
                top: '0px',
                left: '0px',
                height: `${style.height}px`,
                ...commonStyles,
              }}
            />
          </div>,
          cellElement
        );
      })}
    </>
  );
};

export default React.memo(FormulaCellSelectionOverlay);
