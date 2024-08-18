import React, {useEffect, useState} from 'react';
import {ConfigProvider, DatePicker, Input, Popover, Select, Space, Table} from "antd";
import axios from "axios";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import AddResourceButton from "../AddResourceButton";
import ResourceExport from "../ResourceExport";

const CostTable = (props) => {
    const {RangePicker} = DatePicker;
    const currentYear = dayjs().year();
    // 默认值为当年的 1 月 1 日 到 12 月 31 日
    const defaultRange = [`${currentYear}-01`, `${currentYear}-12`];
    const [searchOption, setSearchOption] = useState('ip');
    const [searchValue, setSearchValue] = useState('');
    const [searchFor, setSearchFor] = useState('根据IP地址搜索');
    const [tableData, setTableData] = useState([]);
    const [costMonth, setCostMonth] = useState(defaultRange);
    const [TableLoading, setTableLoading] = useState(true);
    const [paymentFilters, setPaymentFilters] = useState([]);

    const renderWithEllipsis = (text) => (<Popover content={text}>
        <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {text}
        </div>
    </Popover>);

    const TableColumn = [{
        title: '资源类型', width: 100, dataIndex: 'resource_type', key: 'resource_type', fixed: 'left'
    }, {
        title: '资源名',
        width: 200,
        dataIndex: 'usingfor',
        key: 'usingfor',
        fixed: 'left',
        ellipsis: true,
        render: renderWithEllipsis
    }, {title: '单位', dataIndex: 'unit', key: 'unit', width: 200, ellipsis: true, render: renderWithEllipsis}, {
        title: '二级单位',
        dataIndex: 'second_unit',
        key: 'second_unit',
        width: 170,
        ellipsis: true,
        render: renderWithEllipsis
    }, {
        title: '支付方式',
        dataIndex: 'payment',
        key: 'payment',
        width: 120,
        filters: paymentFilters,
        onFilter: (value, record) => record.payment.includes(value)
    }, {
        title: '申请单号',
        dataIndex: 'commit_id',
        key: 'commit_id',
        width: 150,
        ellipsis: true,
        render: renderWithEllipsis
    }, {title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 150}, {
        title: '弹性IP地址', dataIndex: 'eip', key: 'eip', width: 150
    }, {
        title: '系统', dataIndex: 'system', key: 'system', width: 150, ellipsis: true, render: renderWithEllipsis
    }, {title: '规格', dataIndex: 'subject', key: 'subject', width: 110}, {
        title: '存储', dataIndex: 'storage', key: 'storage', width: 175, ellipsis: true, render: renderWithEllipsis
    }, {
        title: '额外计费', dataIndex: 'add_fee', key: 'add_fee', width: 175, ellipsis: true, render: renderWithEllipsis
    }, {title: '创建时间', dataIndex: 'start_time', key: 'start_time', width: 150}, {
        title: '每月费用', dataIndex: 'monthly_price', key: 'monthly_price', width: 95
    }, {title: '计费月数', dataIndex: 'cost_month', key: 'cost_month', width: 95}, {
        title: '总计价格', dataIndex: 'all_price', key: 'all_price', width: 100
    }, {
        title: '备注', dataIndex: 'comment', key: 'comment', width: 250, ellipsis: true, render: renderWithEllipsis
    }, {
        title: '客户', dataIndex: 'client', key: 'client', width: 100, ellipsis: true,
    }, {
        title: '手机号', dataIndex: 'client_phone', key: 'client_phone', width: 130, ellipsis: true,
    }, {title: '操作', key: 'operation', fixed: 'right', width: 100},];

    const SearchOptions = [{value: 'ip', label: 'IP地址'}, {value: '资源名', label: '资源名'},];

    const onSearchOptionSelect = (value) => {
        if (value === "ip") {
            setSearchFor("根据IP地址搜索");
        } else if (value === "资源名") {
            setSearchFor("根据资源名搜索");
        }
        setSearchOption(value);
    };

    useEffect(() => {
        const PostBody = {
            cost_month: costMonth,
            service: props.Project,
            year_version: props.Version,
            search_type: searchOption,
            search: searchValue
        };

        const fetchData = async () => {
            setTableLoading(true);
            try {
                const response = await axios.post('http://127.0.0.1:5000/DescribeCost', PostBody);
                const uniquePayments = [...new Set(response.data.map(({payment}) => payment))];
                const filters = uniquePayments.map(payment => ({text: payment, value: payment}));
                setPaymentFilters(filters);
                setTableData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setTableLoading(false); // 在 finally 中设置加载状态
            }
        };

        if (props.Version && props.Project && costMonth.length > 0) {
            fetchData().then(r => console.log(r))
        }

    }, [props.Version, props.Project, costMonth, searchValue, searchOption]);


    const handleDateChange = (dates) => {
        if (dates) {
            const startMonth = dates[0].format('YYYY-MM');
            const endMonth = dates[1].format('YYYY-MM');
            setCostMonth([startMonth, endMonth]);
        } else {
            setCostMonth([]);
        }
    };

    const defaultSelectedDate = [dayjs(`${currentYear}-01-01`), dayjs(`${currentYear}-12-31`)];

    const onSearchValueChange = (e) => {
        setSearchValue(e.target.value);
        console.log("搜索的内容", searchValue)
    }
    return (<>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <div style={{
                display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", padding: "10px"
            }}>
                <div>
                    <AddResourceButton/>
                    <Space.Compact>
                        <Select defaultValue="ip" options={SearchOptions} onSelect={onSearchOptionSelect}/>
                        <Input placeholder={searchFor} onChange={onSearchValueChange}/>
                    </Space.Compact>
                </div>
                <div>
                    <ConfigProvider locale={zhCN}>
                        <RangePicker picker="month" onChange={handleDateChange} defaultValue={defaultSelectedDate}/>
                    </ConfigProvider>
                    <ResourceExport/>
                </div>
            </div>
            <Table
                columns={TableColumn}
                dataSource={tableData}
                scroll={{
                    x: 1500, y: "72.5vh"
                }}
                loading={TableLoading}
                sticky={{
                    offsetHeader: 64,
                }}
            />
        </div>
    </>);
};

export default CostTable;
