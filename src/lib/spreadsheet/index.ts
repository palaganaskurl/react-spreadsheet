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
