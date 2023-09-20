import React from 'react';
import { Meta, StoryFn } from '@storybook/react';

import { Spreadsheet } from '../components/Spreadsheet';

export default {
  title: 'Basic Spreadsheet',
  component: Spreadsheet,
  argTypes: {},
} as Meta<typeof Spreadsheet>;

const Template: StoryFn<typeof Spreadsheet> = (args) => (
  // @ts-expect-error
  <Spreadsheet {...args} />
);

export const Primary = Template.bind({});

Primary.args = {
  //   text: 'Clicked this many times:',
};
