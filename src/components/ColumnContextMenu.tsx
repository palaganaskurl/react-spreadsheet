import React from 'react';
import { Menu, Item, Separator, ItemParams } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import { useSpreadsheet } from '../state/useSpreadsheet';
import { ColumnContextMenuProps } from '../types';
import { ColumnContextMenuID } from '../constants';

const ColumnContextMenu = () => {
  const insertNewColumnAt = useSpreadsheet((state) => state.insertNewColumnAt);
  const insertNewColumnBefore = ({
    props,
  }: ItemParams<ColumnContextMenuProps, any>) => {
    // eslint-disable-next-line
    if (typeof props?.columnIndex === 'number') {
      // eslint-disable-next-line
      insertNewColumnAt(props?.columnIndex, 'before');
    }
  };
  const insertNewColumnAfter = ({
    props,
  }: ItemParams<ColumnContextMenuProps, any>) => {
    // eslint-disable-next-line
    if (typeof props?.columnIndex === 'number') {
      // eslint-disable-next-line
      insertNewColumnAt(props?.columnIndex, 'after');
    }
  };
  const toBeImplemented = () => {
    alert('To be implemented!');
  };

  return (
    <Menu id={ColumnContextMenuID}>
      <Item onClick={toBeImplemented}>Copy</Item>
      <Separator />
      <Item onClick={insertNewColumnBefore}>Insert 1 column left</Item>
      <Item onClick={insertNewColumnAfter}>Insert 1 column right</Item>
      <Item onClick={toBeImplemented} disabled>
        Delete column
      </Item>
      <Item onClick={toBeImplemented} disabled>
        Clear column
      </Item>
      <Item onClick={toBeImplemented} disabled>
        Hide column
      </Item>
      <Item onClick={toBeImplemented} disabled>
        Resize column
      </Item>
    </Menu>
  );
};

export default ColumnContextMenu;
