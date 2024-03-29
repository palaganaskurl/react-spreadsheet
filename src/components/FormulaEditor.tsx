import React from 'react';
import useFormulaEditor from '../lib/hooks/useFormulaEditor';
import { useSpreadsheet } from '../state/useSpreadsheet';

const FormulaContainerStyle: React.CSSProperties = {
  width: '70%',
  display: 'flex',
  flexDirection: 'row',
  gap: '8px',
};
const FormulaEditorIconStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  padding: '10px',
  alignItems: 'center',
};
const FormulaContentEditorStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  padding: '10px',
};

const FormulaEditor = () => {
  const { resolveFormula } = useFormulaEditor();

  const [activeCellRow, activeCellColumn] = useSpreadsheet(
    (state) => state.activeCell
  );
  const setCellData = useSpreadsheet((state) => state.setCellData);
  const getCell = useSpreadsheet((state) => state.getCell);
  const setIsSelectingCellsForFormula = useSpreadsheet(
    (state) => state.setIsSelectingCellsForFormula
  );
  const setIsEditingAtFormulaEditor = useSpreadsheet(
    (state) => state.setIsEditingAtFormulaEditor
  );

  const onFormulaInput = (e: React.FormEvent<HTMLDivElement>) => {
    const formula = e.currentTarget.textContent?.trim() || '';

    setIsSelectingCellsForFormula(formula.startsWith('='));
    setCellData(activeCellRow, activeCellColumn, {
      value: formula,
    });
    formulaRef.current!.focus();
  };

  const activeCellValue = getCell(activeCellRow, activeCellColumn);

  const formulaRef = React.useRef<HTMLDivElement | null>(null);

  // TODO: Try to format formula entities with color
  // const renderFormulaEntities = () => {
  //   if (activeCellValue?.formulaEntities.size === 0) {
  //     return null;
  //   }

  //   return Array.from(activeCellValue?.formulaEntities || []).map((x) => (
  //     <>
  //       <span key={uuidv4()}>{x.address}</span>
  //     </>
  //   ));
  // };

  React.useEffect(() => {
    formulaRef!.current!.textContent = activeCellValue?.value || '';
  }, [activeCellValue]);

  return (
    <div style={FormulaContainerStyle}>
      <div style={FormulaEditorIconStyle}>
        <img
          alt="formula-icon"
          height="15"
          // eslint-disable-next-line
          src={require('../assets/images/formula-fx-icon.svg')} // TODO: Fix this
        />
      </div>
      <div
        onFocus={() => {
          setIsEditingAtFormulaEditor(true);
        }}
        onBlur={() => {
          setIsEditingAtFormulaEditor(false);
        }}
        suppressContentEditableWarning
        contentEditable
        style={FormulaContentEditorStyle}
        onInput={onFormulaInput}
        ref={formulaRef}
        onKeyUp={(e) => {
          switch (e.key) {
            case 'Enter': {
              if (activeCellValue?.value) {
                resolveFormula(activeCellValue.value);
              }

              break;
            }
            default:
              break;
          }
        }}
        tabIndex={0}
        aria-label="Formula Editor"
        role="textbox"
      >
        {/* {renderFormulaEntities()} */}
      </div>
    </div>
  );
};

export default FormulaEditor;
