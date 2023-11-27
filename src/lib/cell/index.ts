import { FormulaEntity } from '../../types';

import { DefaultCellHeight, DefaultCellWidth } from '../../constants';

class Cell {
  public formulaEntities: FormulaEntity[];

  public id: string;

  public result: number | string;

  public value: string;

  public width: number;

  public height: number;

  public x: number;

  public y: number;

  public row: number;

  public column: number;

  constructor(row: number, column: number) {
    this.formulaEntities = [];
    // TODO: Remove this permanently.
    // this.id = uuidv4();

    this.result = '';
    this.value = '';

    this.row = row - 1;
    this.column = column - 1;

    this.width = DefaultCellWidth;
    this.height = DefaultCellHeight;

    this.x = this.width * column;
    this.y = this.height * row;
  }
}

export default Cell;
