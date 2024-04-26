import React, {useEffect, useState} from 'react';
import {Button, Popover, Table} from 'antd';
import axios from "axios";

const CostTable = (props) => {
    const [data, setData] = useState([]); // 用于存放从接口获取的数据
    const [loading, setLoading] = useState(true); // 用于标识数据是否加载中
    const [cityFilter, setCityFilter] = useState([])
    const [billFilter, setBillFilter] = useState([])
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    useEffect(() => {
        console.log('传参到子组件',props.search)
        const searchJson = JSON.stringify(props.search);
        const fetchData = async () => {
            try {
                // 创建 axios 实例，并设置请求头为 JSON 格式
                const axiosInstance = axios.create({
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                // 获取成本数据
                const costResponse = await axiosInstance.post('http://127.0.0.1:5000/get_cost', searchJson);
                const costData = costResponse.data;
                setData(costData);
                const ctFilter = await axios.get('http://127.0.0.1:5000/city_filter')
                console.log('辖区过滤器:', ctFilter.data)
                setCityFilter(ctFilter.data)
                const blFilter = await axios.get('http://127.0.0.1:5000/subject_filter')
                console.log('计费项目过滤器:', blFilter.data)
                setBillFilter(blFilter.data)
                setLoading(false); // 设置 loading 为 false，表示数据加载完成
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData(); // 在组件挂载时获取数据
    }, [props.search]); // 依赖项为空数组，表示仅在组件挂载时执行一次
    const onChange = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    const handleSwitchButton = (record) => {//变配按钮方法
        // 在这里处理按钮点击事件，可以获取到该行的 record，包括 uuid

        console.log('点击变配按钮', record.key);
        // 执行相应的操作
    };
    const handleCancelButton =(record)=>{//注销按钮方法

        console.log('点击注销按钮', record.key);
    }

    const handleChangeButton = (record) =>{//修改信息按钮方法

        console.log('点击修改信息按钮', record.key);
    }

//----------------------------------------------------------------------------------------------//
    const renderPopoverContent = (content) => (
        <div style={{maxWidth: 300}}>{content}</div>
    );

    const columns = [

        {
            title: '辖区',
            dataIndex: 'city',
            width: '5rem',
            align: 'left',
            filters: cityFilter,
            onFilter: (value, record) => record.city.indexOf(value) === 0,
        },
        {
            title: '申请单号',
            dataIndex: 'commit_id',
            width: '5rem',
            align: 'left',
        },
        {
            title: '单位',
            dataIndex: 'unit',
            width: '12rem',
            align: 'left',
            render: (text) => (
                <Popover content={renderPopoverContent(text)}>
                    <div style={{
                        maxWidth: '12rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>{text}</div>
                </Popover>
            ),
        },
        {
            title: '二级单位',
            dataIndex: 'second_unit', // 注意：这里需要与后端返回的字段对应
            width: '12rem',
            align: 'left',
            render: (text) => (
                <Popover content={renderPopoverContent(text)}>
                    <div style={{
                        maxWidth: '12rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>{text}</div>
                </Popover>
            ),


        },
        {
            title: '项目名称',
            dataIndex: 'service',
            width: '15rem',
            align: 'left',
            render: (text) => (
                <Popover content={renderPopoverContent(text)}>
                    <div style={{
                        maxWidth: '15rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>{text}</div>
                </Popover>
            ),

        },
        {
            title: '主机用途',
            dataIndex: 'usingfor',
            width: '15rem',
            align: 'left',
            render: (text) => (
                <Popover content={renderPopoverContent(text)}>
                    <div style={{
                        maxWidth: '15rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>{text}</div>
                </Popover>
            ),
        },
        {
            title: '系统',
            dataIndex: 'system',
            width: '12rem',
            align: 'left',
            render: (text) => (
                <Popover content={renderPopoverContent(text)}>
                    <div style={{
                        maxWidth: '12rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>{text}</div>
                </Popover>
            ),
        },
        {
            title: '私有IP',
            dataIndex: 'ip',
            width: '5rem',
            align: 'left',
        },
        {
            title: '弹性IP',
            dataIndex: 'eip',
            width: '5rem',
            align: 'left',
        },
        {
            title: '开通时间',
            dataIndex: 'start_time',
            width: '7rem',
            align: 'left',
            render: (text) => {
                const date = new Date(text);
                return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            },
        },
        {
            title: '计费开始时间',
            dataIndex: 'start_bill_time',
            width: '7rem',
            align: 'left',
            render: (text) => {
                const date = new Date(text);
                return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            },
        },
        {
            title: '计费项目',
            dataIndex: 'bill_subject',
            width: '7rem',
            align: 'left',
            filters: billFilter,
            onFilter: (value, record) => record.bill_subject.indexOf(value) === 0,
        },
        {
            title: '计费项目价格',
            dataIndex: 'ItemPrice',
            width: '7rem',
            align: 'left',
        },
        {
            title: 'SSD磁盘（单位G）',
            dataIndex: 'ssd',
            width: '7rem',
            align: 'left',
        },
        {
            title: '高效磁盘（单位G）',
            dataIndex: 'hdd',
            width: '7rem',
            align: 'left',
        },
        {
            title: 'RDS云存储（单位G）',
            dataIndex: 'rds_storage',
            width: '7rem',
            align: 'left',
        },
        {
            title: 'OSS云存储（单位G）',
            dataIndex: 'oss_storage',
            width: '7rem',
            align: 'left',
        },
        {
            title: '对应云存储价格',
            dataIndex: 'cloudStoragePrice',
            width: '7rem',
            align: 'left',
        },
        {
            title: '达梦数据库',
            dataIndex: 'dameng',
            width: '7rem',
            align: 'left',
        },
        {
            title: '人大金仓数据库',
            dataIndex: 'renda',
            width: '7rem',
            align: 'left',
        },
        {
            title: '数据库价格',
            dataIndex: 'database_cn_price',
            width: '7rem',
            align: 'left',
        },
        {
            title: '金蝶',
            dataIndex: 'kingbase',
            width: '7rem',
            align: 'left',
        },
        {
            title: '东方通',
            dataIndex: 'dongfang',
            width: '7rem',
            align: 'left',
        },
        {
            title: '中间件价格',
            dataIndex: 'middleware_price',
            width: '7rem',
            align: 'left',
        },
        {
            title: '默认安全费用',
            dataIndex: 'sec_fee_value',
            width: '7rem',
            align: 'left',
        },
        {
            title: '单台资源计费项目总价',
            dataIndex: 'unitResourceBillingTotal',
            width: '12rem',
            align: 'left',
        },
        {
            title: '备注',
            dataIndex: 'remark',
            width: '12rem',
            align: 'left',
            render: (text) => (
                <Popover content={renderPopoverContent(text)}>
                    <div style={{
                        maxWidth: '12rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>{text}</div>
                </Popover>
            ),
        },
    ];
    const operationColumn = {
        title: '操作',
        dataIndex: 'operation',
        width: '10rem',
        align: 'left',
        fixed: 'right', // 将操作列固定在最右侧
        render: (_, record) => (
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px' }}>
                <Button type="link" onClick={() => handleSwitchButton(record)}>变配</Button><hr/>
                <Button type="link" onClick={() => handleCancelButton(record)}>注销</Button><hr/>
                <Button type="link" onClick={() => handleChangeButton(record)}>修改信息</Button>
            </div>
        ),
    };
    columns.push(operationColumn);
//----------------------------------------------------------------------------------------------//

    const onSelectChange = (selectedKeys) => {
        setSelectedRowKeys(selectedKeys);
        console.log('目前选择了：',selectedKeys)
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    return (
        <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={data}
            onChange={onChange}
            loading={loading}
            scroll={{x: 'max-content'}}
            rowKey="key" // 使用 uuid 作为每行数据的 key
            size="middle"
        />
    );
};


export default CostTable;
