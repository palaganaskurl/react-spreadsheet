import React from 'react';
import { createPortal } from 'react-dom';
import useFormulaEditor from '../lib/hooks/useFormulaEditor';
import { useSpreadsheet } from '../state/useSpreadsheet';
import {
  getCellContainer,
  getGridContainer,
  getNumberFromPXString,
} from '../lib/dom';

import {
  $getRoot,
  $getSelection,
  CLEAR_EDITOR_COMMAND,
  COMMAND_PRIORITY_HIGH,
  EditorState,
  KEY_ENTER_COMMAND,
  LexicalEditor,
} from 'lexical';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

const EnterCommand = () => {
  const [editor] = useLexicalComposerContext();

  // TODO: When write method is "append", make the cursor
  const activeCell = useSpreadsheet((state) => state.activeCell);
  const [activeRow, activeColumn] = activeCell;

  console.log('activeCell', activeCell);

  const setWriteMethod = useSpreadsheet((state) => state.setWriteMethod);
  const setCellData = useSpreadsheet((state) => state.setCellData);
  const getCell = useSpreadsheet((state) => state.getCell);
  const cellData = getCell(activeRow, activeColumn);
  const setIsSelectingCellsForFormula = useSpreadsheet(
    (state) => state.setIsSelectingCellsForFormula
  );
  const setActiveCell = useSpreadsheet((state) => state.setActiveCell);
  const emptyFormulaCellSelectionPoints = useSpreadsheet(
    (state) => state.emptyFormulaCellSelectionPoints
  );
  const { resolveFormula, parseFormula } = useFormulaEditor();

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

      const { evaluatedFormula, formulaResult } = resolveFormula(
        cellData?.value || ''
      );

      if (evaluatedFormula && formulaResult) {
        // Since the Cell is memoized, it doesn't re-render
        //  when the formulaResult is the same.
        // Temporarily, we set the cellRef textContent
        //  manually.
        // cellRef.current!.textContent = formulaResult;
      } else {
        setCellData(activeRow, activeColumn, {
          value: cellContent,
        });
      }

      emptyFormulaCellSelectionPoints();
      setActiveCell(activeRow + 1, activeColumn);
      // TODO: Get back on this setWriteMethod
      // setWriteMethod('overwrite');

      editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
    }

    return true;
  };

  return null;
};

const CellEditor = () => {
  // TODO: When write method is "append", make the cursor
  const activeCell = useSpreadsheet((state) => state.activeCell);
  const [activeRow, activeColumn] = activeCell;

  const writeMethod = useSpreadsheet((state) => state.writeMethod);
  const setWriteMethod = useSpreadsheet((state) => state.setWriteMethod);
  const setCellData = useSpreadsheet((state) => state.setCellData);
  const getCell = useSpreadsheet((state) => state.getCell);
  const cellData = getCell(activeRow, activeColumn);
  const setIsSelectingCellsForFormula = useSpreadsheet(
    (state) => state.setIsSelectingCellsForFormula
  );
  const setActiveCell = useSpreadsheet((state) => state.setActiveCell);
  const emptyFormulaCellSelectionPoints = useSpreadsheet(
    (state) => state.emptyFormulaCellSelectionPoints
  );
  const { resolveFormula, parseFormula } = useFormulaEditor();
  const gridContainer = getGridContainer();

  const activeCellPosition = useSpreadsheet(
    (state) => state.activeCellPosition
  );

  const getStyleOnWriteMethod = React.useCallback((): React.CSSProperties => {
    if (writeMethod === 'append') {
      return {
        outline: '2px solid #a8c7fa',
      };
    }

    return {
      outline: '0px solid #a8c7fa',
    };
  }, [writeMethod]);

  const getCellValue = React.useCallback(() => {
    if (cellData === null) {
      return null;
    }

    if (writeMethod === 'overwrite') {
      if (!cellData?.result) {
        return cellData.value;
      }

      if (typeof cellData?.result === 'object') {
        // @ts-expect-error
        // eslint-disable-next-line
        return cellData?.result._error;
      }

      return cellData?.result.toString();
    }

    return cellData.value;
  }, [cellData, writeMethod]);

  const theme = {
    paragraph: 'lexical-p',
  };

  // try to recover gracefully without losing user data.
  function onError(error) {
    console.error(error);
  }

  const initialConfig = {
    namespace: 'Cell Editor',
    theme,
    onError,
  };

  if (gridContainer === null) {
    return null;
  }

  console.log('gridContainer', gridContainer);

  // if (cellData === null) {
  //   return null;
  // }

  // const onEnter = (
  //   editorState: EditorState,
  //   editor: LexicalEditor,
  //   tags: Set<string>
  // ) => {
  //   const cellContent = editor.getRootElement()?.textContent || '';

  //   setIsSelectingCellsForFormula(false);

  //   const { evaluatedFormula, formulaResult } = resolveFormula(
  //     cellData?.value || ''
  //   );

  //   if (evaluatedFormula && formulaResult) {
  //     // Since the Cell is memoized, it doesn't re-render
  //     //  when the formulaResult is the same.
  //     // Temporarily, we set the cellRef textContent
  //     //  manually.
  //     // cellRef.current!.textContent = formulaResult;
  //   } else {
  //     setCellData(activeRow, activeColumn, {
  //       value: cellContent,
  //     });
  //   }

  //   emptyFormulaCellSelectionPoints();
  //   setActiveCell(activeRow + 1, activeColumn);
  //   // setWriteMethod('overwrite');
  // };

  return createPortal(
    <div
      autoFocus
      id="inputBox"
      style={{
        zIndex: 130,
        position: 'absolute',
        ...getStyleOnWriteMethod(),
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
      onKeyDown={(e) => {
        console.log('E', e);

        if (e.defaultPrevented) {
          return; // Do nothing if the event was already processed
        }

        switch (e.key) {
          case 'ArrowDown': {
            setActiveCell(activeRow + 1, activeColumn);
            e.preventDefault();
            break;
          }
          case 'ArrowUp': {
            setActiveCell(activeRow - 1, activeColumn);
            e.preventDefault();
            break;
          }
          case 'ArrowLeft': {
            setActiveCell(activeRow, activeColumn - 1);
            e.preventDefault();
            break;
          }
          case 'ArrowRight': {
            setActiveCell(activeRow, activeColumn + 1);
            e.preventDefault();
            break;
          }
          default:
            break;
        }
      }}
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
                outline: '2px solid aqua',
                ...activeCellPosition,
              }}
            />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <EnterCommand />
      </LexicalComposer>
    </div>,
    gridContainer
  );
};

export default CellEditor;
