import React from 'react';
import { Menu, Item, Separator, ItemParams } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { RowContextMenuProps } from '../types';
import { RowContextMenuID } from '../constants';

const RowContextMenu = () => {
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
  const toBeImplemented = () => {
    alert('To be implemented!');
  };

  return (
    <Menu id={RowContextMenuID}>
      <Item onClick={toBeImplemented}>Copy</Item>
      <Separator />
      <Item onClick={insertNewRowAbove}>Insert 1 row above</Item>
      <Item onClick={insertNewRowBelow}>Insert 1 row below</Item>
      <Item onClick={toBeImplemented} disabled>
        Delete row
      </Item>
      <Item onClick={toBeImplemented} disabled>
        Clear row
      </Item>
      <Item onClick={toBeImplemented} disabled>
        Hide row
      </Item>
      <Item onClick={toBeImplemented} disabled>
        Resize row
      </Item>
    </Menu>
  );
};

export default RowContextMenu;
