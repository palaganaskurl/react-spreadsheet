import React from 'react';
import { Meta, StoryFn } from '@storybook/react';

import CanvasSpreadsheet from '../components/CanvasSpreadsheet';

export default {
  title: 'Canvas Spreadsheet',
  component: CanvasSpreadsheet,
  argTypes: {},
} as Meta<typeof CanvasSpreadsheet>;

const Template: StoryFn<typeof CanvasSpreadsheet> = (args) => (
  // @ts-expect-error
  <CanvasSpreadsheet {...args} />
);

export const Primary = Template.bind({});

Primary.args = {
  //   text: 'Clicked this many times:',
};
