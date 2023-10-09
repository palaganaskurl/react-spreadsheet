import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { SelectionOverlayStyle } from '../types';
import { selectionBorderWidth } from '../constants';

const FormulaCellSelectionOverlay = () => {
  const formulaCellSelections = useSpreadsheet(
    (state) => state.formulaCellSelections
  );

  if (formulaCellSelections.length === 0) {
    return null;
  }

  const getOverlayStyles = (): SelectionOverlayStyle[] => {
    const styles: SelectionOverlayStyle[] = [];

    formulaCellSelections.forEach((selection) => {
      const [row, column] = selection.point;
      const cellElement = document.querySelector(
        `[data-row="${row}"][data-column="${column}"]`
      );

      if (!cellElement) {
        return;
      }

      const cellElementBoundingClientRect =
        cellElement?.getBoundingClientRect();

      styles.push({
        borderColor: selection.borderColor,
        top: cellElementBoundingClientRect.top + window.scrollY,
        left: cellElementBoundingClientRect.left + window.scrollX,
        width: cellElementBoundingClientRect.width,
        height: cellElementBoundingClientRect.height,
      });
    });

    return styles;
  };

  const commonStyles: React.CSSProperties = {
    position: 'absolute',
    userSelect: 'none',
  };

  return (
    <div id="formulaSelectionOverlay">
      {getOverlayStyles().map((style) => {
        const borderColor = `#${style.borderColor}`;

        return (
          <div
            style={{
              top: `${style.top}px`,
              left: `${style.left}px`,
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
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(FormulaCellSelectionOverlay);
