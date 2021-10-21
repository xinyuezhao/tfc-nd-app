import React, {useCallback, useState} from 'react';
import {
    ObjectPicker,
} from 'blueprint-react';
import _ from 'lodash';
import {getData, DetailRenderer} from './utils';
import CreateNew from './CreateNew';

/**
 * Example for adding create new component with createItemRenderer props
 * Please see files CreateNew and CreateNewCls to see the use of useObjectPickerSubmit and shouldSubmit
 */

export default () => {
  const [value, setValue] = useState();
  const [data, setData] = useState(getData(0, 10, 10));
  const handleSelect = useCallback((item, isNew)=> {
    let newData = data;
    if(isNew) {
        newData = [item, ...data];
    }
    setValue(item);
    setData(newData);
  }, [data]);

  return (
    <ObjectPicker
      data={data}
      multiSelect={false}
      filterBy={(item, str) => item.name.indexOf(str) !== -1}
      labelSuffix={'Tenant'}
      value={value}
      onSelect={handleSelect}
      detailItemRenderer={DetailRenderer}
      idBy='id'
      createItemRenderer={CreateNew}
    />
  );
}