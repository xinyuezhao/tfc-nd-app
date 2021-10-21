import React from 'react';
import _ from 'lodash';

const getData = (page, pageSize, max) => {
    const start = page * pageSize;
    const end = Math.min(start + pageSize, max)
    const data = _.range(start, end).map((i) => ({
        name: 'Name ' + i,
        description: 'Description ' + i,
        id: 'id_' + i}));
    return data;
}

const getSearchData = (page, pageSize, max, str = '') => {
    const allData = _.range(0, max)
                        .map((i) => ({
                            name: 'Name ' + i,
                            description: 'Description ' + i,
                            id: i })
                        )
                        .filter((item) => item.name.indexOf(str) !== -1);
    const pageData = allData.slice(page * pageSize, page * pageSize + pageSize);
    return {
        data: pageData,
        total: allData.length
    }
}

const DetailRenderer = (props) => {
    const {
        item
    } = props;
    return (
        <div className="object-picked-ex-detail-renderer">
            <div>Name: {item.name }</div>
            <div>Description: {item.description }</div>
        </div>
    );
}

export {
    getData,
    DetailRenderer,
    getSearchData
}

