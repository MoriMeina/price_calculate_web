import React, {useState} from 'react';
import {Button, Input, Select} from 'antd';
import CostTable from "../Table";

const Option = Select

const {Search} = Input;

const MainCost = () => {
    const [options, setOptions] = useState('ip')
    const [placeh, setPlaceh] = useState('根据ip进行搜索')
    const [search, setSearch] = useState({})

    const onSearch = (value) => {
        console.log('未处理的搜索值:',value)
        const searchOption = {}
        let processedValue = value;

        // If the value contains commas, split it into an array
        if (value.includes(',')) {
            processedValue = value.split(',').map(item => item.trim());
            console.log('处理后的搜索值:',processedValue)
            console.log('处理完当前option值:',options)
        }
        if (options === 'commit_id') {
            searchOption.commit_id = processedValue;
        } else if (options === 'units') {
            searchOption.units = processedValue;
        } else if (options === 'second_unit') {
            searchOption.second_unit = processedValue;
        } else if (options === 'service') {
            searchOption.service = processedValue;
        } else if (options === 'usingfor') {
            searchOption.usingfor = processedValue;
        } else if (options === 'ip') {
            searchOption.ip = processedValue;
        }
        console.log('搜索内容:', searchOption)
        setSearch(searchOption)

    }

    const handleOptionChanged = (value) => {
        if (value === 'commit_id') setPlaceh('根据申请单号搜索')
        if (value === 'units') setPlaceh('根据单位搜索')
        if (value === 'second_unit') setPlaceh('根据二级单位搜索')
        if (value === 'service') setPlaceh('根据项目名搜索')
        if (value === 'usingfor') setPlaceh('根据主机用途搜索')
        if (value === 'ip') setPlaceh('根据IP地址搜索')
        console.log('搜索过滤:', value)
        setOptions(value)

    }
    const selectBefore = (
        <Select defaultValue="ip" onChange={handleOptionChanged} style={{width: "7rem"}}>
            <Option value="commit_id">申请单号</Option>
            <Option value="units">单位</Option>
            <Option value="second_unit">二级单位</Option>
            <Option value="service">项目名</Option>
            <Option value="usingfor">主机用途</Option>
            <Option value="ip">IP地址</Option>
        </Select>
    );
    return (
        <div>
            <div className="buttons">
                <Button/>
                <Search addonBefore={selectBefore} placeholder={placeh} onSearch={onSearch} enterButton/>
            </div>
            <CostTable search={search}/>
        </div>
    )
}
export default MainCost;