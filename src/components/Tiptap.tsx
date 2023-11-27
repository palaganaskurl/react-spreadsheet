import React from 'react';
import { EditorProvider, FloatingMenu, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const extensions = [StarterKit];

const Tiptap = () => {
  console.log('wtf');

  return <EditorProvider extensions={extensions}>{/*  */}</EditorProvider>;
};

export default Tiptap;
