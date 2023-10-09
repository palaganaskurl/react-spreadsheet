export const placeCaretAtEnd = (el: HTMLElement) => {
  const selection = window.getSelection();
  const range = document.createRange();

  selection!.removeAllRanges();
  range.selectNodeContents(el);
  range.collapse(false);
  selection!.addRange(range);

  el.focus();
};

export const focusOnCell = (row: number, column: number) => {
  const cell = document.querySelector(
    `[data-row="${row}"][data-column="${column}"]`
  );

  if (cell instanceof HTMLDivElement) {
    cell.focus();
  }
};
