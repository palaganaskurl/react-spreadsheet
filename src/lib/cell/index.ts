import { v4 as uuidv4 } from 'uuid';
import { FormulaEntity } from '../../types';

class Cell {
  public formulaEntities: FormulaEntity[];

  public id: string;

  public result: number | string;

  public value: string;

  constructor() {
    this.formulaEntities = [];
    this.id = uuidv4();

    this.result = '';
    this.value = '';
  }
}

export default Cell;
