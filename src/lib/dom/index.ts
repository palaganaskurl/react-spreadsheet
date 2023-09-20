export const placeCaretAtEnd = (el: HTMLElement) => {
  // TODO: Check why it selects all before placing the caret at the end.
  el.focus();

  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);

  const selection = window.getSelection();
  selection!.removeAllRanges();
  selection!.addRange(range);
};
