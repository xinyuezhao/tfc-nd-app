import React, {useState, useCallback} from 'react';
import {
    Input,
    useObjectPickerSubmit
} from 'blueprint-react';
import _ from 'lodash';
// import './CiscoObjectPicker.scss';

/**
 * A sample of create new renderer funciton component that is passed as createItemRenderer.
 * Please see the use of useObjectPickerSubmit to get the click event on Modal create button
 */

export default (props) => {

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useObjectPickerSubmit(() => {
        props.onSuccess({
            name: name,
            description: description,
            id: _.uniqueId()
        });
    }, props.status)

    const handleOnNameChange = useCallback((evt) => {
        setName(evt.target.value);
    }, []);

    const handleOnDescrChange = useCallback((evt) => {
        setDescription(evt.target.value);
    }, []);

    return (
        <div className="object-picker-create-new">
            <Input label="Name" value={name} required onChange={handleOnNameChange}/>
            <Input label="Description" value={description} required onChange={handleOnDescrChange}/>
        </div>
    );
}

