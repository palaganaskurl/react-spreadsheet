import React from 'react';
import {
  CLEAR_EDITOR_COMMAND,
  COMMAND_PRIORITY_HIGH,
  KEY_ENTER_COMMAND,
} from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { createPortal } from 'react-dom';
import { useSpreadsheet } from '../state/useSpreadsheet';
import useFormulaEditor from '../lib/hooks/useFormulaEditor';
import { ActiveCellPosition } from '../types';
import { getKonvaContainer } from '../lib/dom';

const FocusPlugin = () => {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    editor.focus();
  }, [editor]);

  return null;
};

const EnterCommand = () => {
  const [editor] = useLexicalComposerContext();

  const activeCell = useSpreadsheet((state) => state.activeCell);
  const [activeRow, activeColumn] = activeCell;

  const setIsSelectingCellsForFormula = useSpreadsheet(
    (state) => state.setIsSelectingCellsForFormula
  );
  const setActiveCell = useSpreadsheet((state) => state.setActiveCell);
  const setIsCellEditorFocused = useSpreadsheet(
    (state) => state.setIsCellEditorFocused
  );
  // const emptyFormulaCellSelectionPoints = useSpreadsheet(
  //   (state) => state.emptyFormulaCellSelectionPoints
  // );
  const canvasStage = useSpreadsheet((state) => state.canvasStage);
  const { resolveFormula } = useFormulaEditor();

  React.useEffect(
    () =>
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        enterEvent,
        COMMAND_PRIORITY_HIGH
      ),
    [editor]
  );

  const enterEvent = (event: KeyboardEvent) => {
    const { shiftKey, key } = event;

    if (key === 'Enter' && shiftKey === false) {
      event.preventDefault();

      const cellContent = editor.getRootElement()?.textContent || '';

      setIsSelectingCellsForFormula(false);

      resolveFormula(cellContent);

      const nextCells = canvasStage?.find(
        `#cell-${activeRow + 1}-${activeColumn}`
      );

      if (nextCells) {
        const nextCell = nextCells[0].getAttrs();
        const activeCellPosition: ActiveCellPosition = {
          width: nextCell.width,
          height: nextCell.height,
          // TODO: Need to know why I have to add 15px
          top: nextCell.y,
          left: nextCell.x,
        };

        setActiveCell(activeRow + 1, activeColumn, activeCellPosition);
      }

      // emptyFormulaCellSelectionPoints();

      setIsCellEditorFocused(false);

      editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
    }

    return true;
  };

  return null;
};

const CellEditor = () => {
  // const activeCell = useSpreadsheet((state) => state.activeCell);
  // const [activeRow, activeColumn] = activeCell;

  // const setCellData = useSpreadsheet((state) => state.setCellData);
  // const getCell = useSpreadsheet((state) => state.getCell);
  // const cellData = getCell(activeRow, activeColumn);
  // const setIsSelectingCellsForFormula = useSpreadsheet(
  //   (state) => state.setIsSelectingCellsForFormula
  // );
  // const emptyFormulaCellSelectionPoints = useSpreadsheet(
  //   (state) => state.emptyFormulaCellSelectionPoints
  // );
  const isCellEditorFocused = useSpreadsheet(
    (state) => state.isCellEditorFocused
  );

  const activeCellPosition = useSpreadsheet(
    (state) => state.activeCellPosition
  );

  const theme = {
    paragraph: 'lexical-p',
  };

  // try to recover gracefully without losing user data.
  function onError(error: any) {
    console.error(error);
  }

  const initialConfig = {
    namespace: 'Cell Editor',
    theme,
    onError,
  };

  const konvaJSContainer = getKonvaContainer();

  if (!konvaJSContainer) {
    return null;
  }

  if (isCellEditorFocused === false) {
    return null;
  }

  if (activeCellPosition === null) {
    return null;
  }

  return createPortal(
    <div
      id="inputBox"
      style={{
        position: 'absolute',
        ...activeCellPosition,
      }}
      // onBeforeInput={(e) => {
      //   if (writeMethod === 'overwrite') {
      //     e.currentTarget.textContent = '';
      //   }
      // }}
      // onInput={(e) => {
      //   console.log('input');
      //   const cellContent = e.currentTarget.textContent || '';

      //   if (cellContent.startsWith('=')) {
      //     setIsSelectingCellsForFormula(true);
      //     setWriteMethod('append');
      //     parseFormula(e);
      //   }

      //   if (writeMethod === 'overwrite') {
      //     setWriteMethod('append');
      //   }

      //   setCellData(activeRow, activeColumn, {
      //     value: cellContent,
      //   });
      // }}
      // onKeyDown={(e) => {
      //   console.log('E', e);

      //   if (e.defaultPrevented) {
      //     return; // Do nothing if the event was already processed
      //   }

      //   switch (e.key) {
      //     case 'ArrowDown': {
      //       setActiveCell(activeRow + 1, activeColumn);
      //       e.preventDefault();
      //       break;
      //     }
      //     case 'ArrowUp': {
      //       setActiveCell(activeRow - 1, activeColumn);
      //       e.preventDefault();
      //       break;
      //     }
      //     case 'ArrowLeft': {
      //       setActiveCell(activeRow, activeColumn - 1);
      //       e.preventDefault();
      //       break;
      //     }
      //     case 'ArrowRight': {
      //       setActiveCell(activeRow, activeColumn + 1);
      //       e.preventDefault();
      //       break;
      //     }
      //     default:
      //       break;
      //   }
      // }}
      // onKeyUp={(e) => {
      //   switch (e.key) {
      //     case 'Enter': {
      //       const cellContent = e.currentTarget.textContent ?? '';

      //       setIsSelectingCellsForFormula(false);

      //       const { evaluatedFormula, formulaResult } = resolveFormula(
      //         cellData?.value || ''
      //       );

      //       if (evaluatedFormula && formulaResult) {
      //         // Since the Cell is memoized, it doesn't re-render
      //         //  when the formulaResult is the same.
      //         // Temporarily, we set the cellRef textContent
      //         //  manually.
      //         // cellRef.current!.textContent = formulaResult;
      //       } else {
      //         setCellData(activeRow, activeColumn, {
      //           value: cellContent,
      //         });
      //       }

      //       emptyFormulaCellSelectionPoints();
      //       setActiveCell(activeRow + 1, activeColumn);
      //       setWriteMethod('overwrite');

      //       break;
      //     }
      //     case 'Escape': {
      //       setIsSelectingCellsForFormula(false);
      //       emptyFormulaCellSelectionPoints();

      //       // TODO: Ideally, this should be set to the value
      //       //  before Enter or Blurred.
      //       // Maybe need to check on saving the value while
      //       //  user is inputting
      //       setCellData(activeRow, activeColumn, {
      //         value: cellData?.value,
      //       });
      //       setWriteMethod('overwrite');
      //       break;
      //     }
      //     default:
      //       break;
      //   }
      // }}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              id="cellEditor"
              style={{
                ...activeCellPosition,
                outline: 'none',
              }}
            />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <EnterCommand />
        <FocusPlugin />
      </LexicalComposer>
    </div>,
    konvaJSContainer
  );
};

export default React.memo(CellEditor);
