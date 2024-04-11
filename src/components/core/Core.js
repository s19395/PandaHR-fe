import * as React from 'react';
import Content from './Content';
import FixedDrawer from './FixedDrawer';

export default function Core() {
  return (
    <>
      <FixedDrawer />
      <Content />
    </>
  );
}
