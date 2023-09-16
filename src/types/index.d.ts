export type HeaderData = {
  height: number;
  index: number;
  label: string;
  width: number;
};

export type CellData = {
  column: number;
  height: number;
  row: number;
  value?: number | string;
  width: number;
};

export interface CellProps {
  column: number;
  height: number;
  row: number;
  width: number;
}
