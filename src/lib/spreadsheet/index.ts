const chars = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

export const numberToExcelHeader = (index: number): string => {
  const currentIndex = index - 1;
  const quotient = Math.floor(currentIndex / 26);

  if (quotient > 0) {
    return numberToExcelHeader(quotient) + chars[currentIndex % 26];
  }

  return chars[currentIndex % 26];
};

export const numberToExcelHeaderArray = (columnCount: number): string[] => {
  const columnHeaders = [];

  for (let i = 1; i <= columnCount; i++) {
    columnHeaders.push(numberToExcelHeader(i));
  }

  return columnHeaders;
};

export const getCellAddressLabel = (row: number, column: number): string =>
  `${numberToExcelHeader(column + 1)}${row + 1}`;

export const cellAddressToIndex = (cellAddress: string) => {
  const columnLettersMatch = cellAddress.match(/[A-Z]+/);

  if (columnLettersMatch === null) {
    return null;
  }

  const columnLetters = columnLettersMatch[0];
  const rowNumberMatch = cellAddress.match(/[0-9]+/);

  if (rowNumberMatch === null) {
    return null;
  }

  const rowNumber = parseInt(rowNumberMatch[0], 10);

  let columnIndex = 0;

  for (let i = 0; i < columnLetters.length; i++) {
    const charCode = columnLetters.charCodeAt(i) - 65; // 'A' has char code 65
    columnIndex = columnIndex * 26 + charCode + 1;
  }

  return {
    row: rowNumber - 1,
    column: columnIndex - 1,
  };
};
