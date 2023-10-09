import { FormulaEntity } from '../../types';

export const isOperation = (s: string) => {
  const regex = /[+\-*/()]/g;
  const found = s.match(regex);

  return (found?.length || 0) > 0;
};

export const parseFormula = (s: string) => {
  // Remove whitespace from the expression
  const expression = s.replace(/\s/g, '');

  // Define the regular expression pattern for variables, numbers, and operators
  const tokenPattern = /[a-zA-Z][a-zA-Z0-9]*|\d+(\.\d+)?|[+\-*/()]/g;

  // Extract tokens from the expression while maintaining the order
  const tokens = [];
  const allMatches = expression.match(tokenPattern) || [];

  // Create tokens array with position information
  for (let i = 0; i < allMatches.length; i++) {
    let label = '';

    if (isOperation(allMatches[i])) {
      label = 'operator';
    } else {
      label = 'variable';
    }

    tokens.push({
      value: allMatches[i],
      label,
    });
  }

  // Return the array of tokens
  return tokens;
};

export const getEntityCountByType = (entities: Set<FormulaEntity>) => {
  let operationCount = 0;
  let variableCount = 0;

  entities.forEach((entity) => {
    if (entity.type === 'variable') {
      variableCount++;
    } else if (entity.type === 'operation') {
      operationCount++;
    }
  });

  return {
    operationCount,
    variableCount,
  };
};
