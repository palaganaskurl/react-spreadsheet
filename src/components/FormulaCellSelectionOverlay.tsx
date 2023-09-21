import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { SelectionOverlayStyle } from '../types';

const FormulaCellSelectionOverlay = () => {
  const formulaCellSelectionPoints = useSpreadsheet(
    (state) => state.formulaCellSelectionPoints
  );

  const getOverlayStyles = (): SelectionOverlayStyle[] => {
    const styles: SelectionOverlayStyle[] = [];

    formulaCellSelectionPoints.forEach((point) => {
      const [row, column] = point;
      const cellElement = document.querySelector(
        `[data-row="${row}"][data-column="${column}"]`
      );

      if (!cellElement) {
        return;
      }

      const cellElementBoundingClientRect =
        cellElement?.getBoundingClientRect();

      styles.push({
        top: cellElementBoundingClientRect.top,
        left: cellElementBoundingClientRect.left,
        width: cellElementBoundingClientRect.width,
        height: cellElementBoundingClientRect.height,
      });
    });

    return styles;
  };

  const commonStyles: React.CSSProperties = {
    borderStyle: 'dashed',
    position: 'absolute',
    userSelect: 'none',
  };

  const generateRandomColor = (): string =>
    Math.floor(Math.random() * 16777215).toString(16);

  return (
    <>
      {getOverlayStyles().map((style) => {
        const borderColor = generateRandomColor();

        commonStyles.borderColor = `#${borderColor}`;

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
                borderTopWidth: 1,
                top: '-1px',
                width: `${style.width - 5}px`,
                left: '-1px',
                ...commonStyles,
              }}
            />
            <div
              style={{
                borderBottomWidth: 1,
                top: `${style.height - 4}px`,
                width: `${style.width - 5}px`,
                left: '-1px',
                ...commonStyles,
              }}
            />
            <div
              style={{
                borderRightWidth: 1,
                top: '-1px',
                height: `${style.height - 5}px`,
                left: `${style.width - 4}px`,
                ...commonStyles,
              }}
            />
            <div
              style={{
                borderLeftWidth: 1,
                top: '-1px',
                left: '-1px',
                height: `${style.height - 5}px`,
                ...commonStyles,
              }}
            />
          </div>
        );
      })}
    </>
  );
};

export default FormulaCellSelectionOverlay;
