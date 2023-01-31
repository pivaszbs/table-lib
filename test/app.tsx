import React from 'react';
import Axios from 'axios';
import { render } from 'react-dom';
import { TableConfig } from './tableConfig';
import { TableDataMock } from './tableDataMock';
import { TableGenerator } from "../src";

export const Test = () => {
  render(
    <TableGenerator isMock linkRouterHandler={() => {}} tableConfig={TableConfig} tableDataMock={TableDataMock} client={Axios.create()} />,
    document.getElementById('app')
  );
};
