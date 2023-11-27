export const getCellContainer = (
  row: number,
  column: number
): HTMLDivElement | null => {
  const cellContainer = document.querySelector<HTMLDivElement>(
    `[data-row="${row}"][data-column="${column}"]`
  );

  return cellContainer;
};

export const getKonvaContainer = () =>
  document.querySelector('.konvajs-content');

export const getNumberFromPXString = (size: string) =>
  parseInt(size.replace('px', ''), 10);
