import React from 'react';
import { Menu, Item, Separator, Submenu, ItemParams } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { RowContextMenuProps } from '../types';

const RowContextMenu = () => {
  const MENU_ID = 'RowContextMenu';

  const insertNewRowAt = useSpreadsheet((state) => state.insertNewRowAt);
  const insertNewRowAbove = ({
    props,
  }: ItemParams<RowContextMenuProps, any>) => {
    // eslint-disable-next-line
    if (typeof props?.rowIndex === 'number') {
      // eslint-disable-next-line
      insertNewRowAt(props?.rowIndex, 'before');
    }
  };
  const insertNewRowBelow = ({
    props,
  }: ItemParams<RowContextMenuProps, any>) => {
    // eslint-disable-next-line
    if (typeof props?.rowIndex === 'number') {
      // eslint-disable-next-line
      insertNewRowAt(props?.rowIndex, 'after');
    }
  };

  return (
    <Menu id={MENU_ID}>
      <Item onClick={insertNewRowAbove}>Insert 1 row above</Item>
      <Item onClick={insertNewRowBelow}>Insert 1 row below</Item>
      <Separator />
      <Item disabled>Disabled</Item>
      <Separator />
      <Submenu label="Submenu">
        <Item onClick={insertNewRowBelow}>Sub Item 1</Item>
        <Item onClick={() => {}}>Sub Item 2</Item>
      </Submenu>
    </Menu>
  );
};

export default RowContextMenu;
