import * as React from 'react';
import { Menu, Dropdown } from 'antd';

import './AddComponentButton.less';

const addIconClear = require('../../../shared/images/addIconClear.svg');

const AddComponentButton: React.FC<{
  addNewStep: () => void;
  addDataTable?: () => void;
  addCode?: () => void;
  addDataset?: () => void;
}> = ({ addNewStep, addDataTable, addCode, addDataset }) => {
  const menu = (
    <Menu>
      <Menu.Item onClick={addNewStep}>Canvas: Add a New Step</Menu.Item>
      {addDataTable && (
        <Menu.Item disabled onClick={addDataTable}>
          Canvas: Add a Data Table
        </Menu.Item>
      )}
      {addCode && (
        <Menu.Item disabled onClick={addCode}>
          Project: Create a New Code Resource
        </Menu.Item>
      )}
      {addDataset && (
        <Menu.Item disabled onClick={addDataset}>
          Project: Create a New Dataset Resource
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <div className="add-component-button">
      <Dropdown overlay={menu} placement="topRight">
        <img className="add-component-button__icon" src={addIconClear} />
      </Dropdown>
    </div>
  );
};

export default AddComponentButton;
