import React, {useEffect, useState} from 'react';
import {
    Button,
    ConfigProvider,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    notification,
    Popover,
    Select,
    Space,
    Spin,
    Table
} from "antd";
import axios from "axios";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import AddResourceButton from "../AddResourceButton";
import ResourceExport from "../ResourceExport";
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";

const CostTable = (props) => {
    const {RangePicker} = DatePicker;
    const currentYear = dayjs().year();
    const currentDay = dayjs().day()
    const defaultRange = [`${currentYear}-01`, `${currentYear}-12`];
    const [searchOption, setSearchOption] = useState('ip');
    const [searchValue, setSearchValue] = useState('');
    const [searchFor, setSearchFor] = useState('根据IP地址搜索');
    const [tableData, setTableData] = useState([]);
    const [costMonth, setCostMonth] = useState(defaultRange);
    const [TableLoading, setTableLoading] = useState(true);
    const [paymentFilters, setPaymentFilters] = useState([]);
    const [form] = Form.useForm();

    const [refresh, setRefresh] = useState(0)

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
    }, {
        title: '规格', dataIndex: 'subject', key: 'subject', width: 120, ellipsis: true, render: renderWithEllipsis
    }, {
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
    }, {
        title: '操作', key: 'operation', fixed: 'right', width: 200, render: (text, record) => (<Space size="middle">
            {!(record.ischanged === true || record.ischanged === false) && (<>
                <Button type="link" onClick={() => handleChange(record.key)}>变配</Button>
                <Button type="link" onClick={() => handleCancel(record.key)}>注销</Button>
            </>)}
        </Space>)
    },];

    useEffect(() => {
        setAddVersion(props.Version)
    }, [props.Version]);

    const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [addVersion, setAddVersion] = useState('2024');
    const [addFee, setAddFee] = useState([])
    const [visibleFields, setVisibleFields] = useState({})
    const [selectKey, setSelectKey] = useState("")
    const second_unit = Form.useWatch('second_unit', form);
    const service = Form.useWatch('service', form);
    const usingfor = Form.useWatch('usingfor', form);
    const commit_id = Form.useWatch('commit_id', form);
    const productValue = Form.useWatch('product', form);
    const format = Form.useWatch('format', form);
    const system = Form.useWatch('system', form);
    const ssd = Form.useWatch('ssd', form);
    const hdd = Form.useWatch('hdd', form);
    const rds_storage = Form.useWatch('rds_storage', form);
    const oss_storage = Form.useWatch('oss_storage', form);
    const ip = Form.useWatch('ip', form);
    const eip = Form.useWatch('eip', form);
    const changed_time = Form.useWatch('changed_time', form);
    const addFeeValue = Form.useWatch('addFee', form);
    const comment = Form.useWatch('comment', form)
    const {Option} = Select;

    const [formatList, setFormatList] = useState([]);


    useEffect(() => {
        // Update visible fields based on product value
        switch (productValue) {
            case 'ECS':
                setVisibleFields({
                    rds_storage: false,
                    oss_storage: false,
                    system: true,
                    ssd: true,
                    hdd: true,
                    ip: true,
                    eip: true,
                    changed_time: true,
                });
                break;
            case 'RDS':
            case 'PolarDB':
                setVisibleFields({
                    rds_storage: true,
                    oss_storage: false,
                    system: false,
                    ssd: false,
                    hdd: false,
                    ip: true,
                    eip: false,
                    changed_time: true,
                });
                break;
            case 'OSS':
                setVisibleFields({
                    rds_storage: false,
                    oss_storage: true,
                    system: false,
                    ssd: false,
                    hdd: false,
                    ip: false,
                    eip: false,
                    changed_time: true,
                });
                break;
            case 'SLB':
                setVisibleFields({
                    rds_storage: false,
                    oss_storage: false,
                    system: false,
                    ssd: false,
                    hdd: false,
                    ip: true,
                    eip: true,
                    changed_time: true,
                });
                break;
            default:
                setVisibleFields({
                    rds_storage: false,
                    oss_storage: false,
                    system: true,
                    ssd: true,
                    hdd: true,
                    ip: true,
                    eip: true,
                    changed_time: true,
                });
                break;
        }
    }, [productValue]);
    const handleChange = async (key) => {
        setIsChangeModalOpen(true);
        message.info(`变配操作，Key: ${key}`);
        setSelectKey(key)

        try {
            axios.get("/yd_xc/api/GetAddFee", {params: {addVersion}}) // 带上 version 参数
                .then((response) => {
                    setAddFee(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching the AddFee data:", error);
                })
            // 请求数据
            const response = await axios.get(`/yd_xc/api/getCostByKey`, {
                params: {key}
            });

            // 获取返回的数据
            const data = response.data;

            // 解析 add_fee 字段
            let parsedAddFee = [];
            if (data.add_fee) {
                try {
                    const addFeeObject = JSON.parse(data.add_fee);
                    parsedAddFee = addFeeObject.add_fee.map(fee => {
                        const [add_product, count] = Object.entries(fee)[0];
                        return {
                            add_product: parseInt(add_product, 10), count
                        };
                    });
                } catch (error) {
                    console.error('解析 add_fee 数据失败:', error);
                    message.error('解析附加费用数据失败');
                }
            }

            // 设置表单字段的值
            form.setFieldsValue({
                city: data.city || '',
                unit: data.unit || '',
                second_unit: data.second_unit || '',
                service: data.service || '',
                commit_id: data.commit_id || '',
                usingfor: data.usingfor || '',
                product: data.resource_type || '',
                payment: data.payment || '',
                format: data.subject || '',
                system: data.system || '',
                ssd: data.ssd || 0,
                hdd: data.hdd || 0,
                rds_storage: data.rds_storage || 0,
                oss_storage: data.oss_storage || 0,
                ip: data.ip || '',
                eip: data.eip || '',
                changed_time: currentDay ? dayjs(data.changed_time) : null,
                addFee: parsedAddFee
            });

            const productBack = data.resource_type;
            axios.get('/yd_xc/api/getFormatsByProduct', {params: {product: productBack}})
                .then(response => {
                    const formats = response.data.map(format => ({
                        title: format.label, value: format.value,
                    }));
                    setFormatList(formats);
                    console.log(formatList);
                })
                .catch(error => {
                    console.error('获取格式数据失败:', error);
                });

        } catch (error) {
            console.error('Error fetching cost data:', error);
            message.error('获取变配数据失败');
        }
    };
    const [modifyRequest, setModifyRequest] = useState({})
    const [cancelRequest, setCancelRequest] = useState({})
    useEffect(() => {
        // Ensure addFeeValue is an array before calling map
        const formattedAddFee = (addFeeValue || []).map(item => {
            // Check if item has the add_product property and count
            if (item && item.add_product !== undefined && item.count !== undefined) {
                return {
                    [item.add_product]: item.count
                };
            }
            // Return a default value if item is invalid
            return {};
        });

        const formatModifyRequest = {
            "uuid": selectKey,
            "commit_id": commit_id,
            "system": system,
            "ip": ip,
            "eip": eip,
            "changed_time": dayjs(changed_time).format('YYYY-MM-DD HH:mm:ss'),
            "bill_subject": format,
            "ssd": ssd,
            "hdd": hdd,
            "rds_storage": rds_storage,
            "oss_storage": oss_storage,
            "comment": comment,
            "addFee": formattedAddFee,
        };
        const formatCancelRequest = {
            "uuid": selectKey, "cancel_time": dayjs(changed_time).format('YYYY-MM-DD HH:mm:ss'), "comment": comment,
        }

        setModifyRequest(formatModifyRequest)
        setCancelRequest(formatCancelRequest)

        console.log("添加变配字段:", modifyRequest);
    }, [second_unit, service, commit_id, usingfor, productValue, system, ip, eip, changed_time, format, ssd, hdd, rds_storage, oss_storage, addFeeValue, comment]);


    const handleChangeOK = () => {
        setConfirmLoading(true)
        axios.post("/yd_xc/api/ModifyCost", modifyRequest)
            .then((response) => {
                if (response.status === 200 || response.status === 201) {
                    notification.success({
                        message: '成功', description: '资源变配成功。',
                    });
                    form.resetFields(['city', 'unit', 'second_unit', 'service', 'commit_id', 'usingfor', 'payment', 'client', 'client_phone', 'format', 'system', 'ssd', 'hdd', 'rds_storage', 'oss_storage', 'ip', 'eip', 'start_time', 'addFee', 'comment']);
                    setFormatList([]);
                    setVisibleFields({}); // 取消时清空字段的可见性
                    setIsChangeModalOpen(false);
                    setRefresh(refresh + 1)
                } else {
                    notification.error({
                        message: '失败', description: '变配失败。',
                    });
                }
            })
            .catch((error) => {
                console.error("Error sending the request:", error);
                notification.error({
                    message: '错误', description: '发生了错误，请稍后再试。',
                });
            })
            .finally(() => {
                setConfirmLoading(false);
            });
        setConfirmLoading(false)
        setIsChangeModalOpen(false)
    }
    const handleChangeCancel = () => {
        setIsChangeModalOpen(false)
        form.resetFields(['city', 'unit', 'second_unit', 'service', 'commit_id', 'usingfor', 'payment', 'client', 'client_phone', 'format', 'system', 'ssd', 'hdd', 'rds_storage', 'oss_storage', 'ip', 'eip', 'changed_time', 'addFee', 'comment']);
        setRefresh(refresh + 1)
        // setFormatList([]);
        // setVisibleFields({});
    }
    const handleCancelOK = () => {
        setConfirmLoading(true)
        axios.post("/yd_xc/api/CancelCost", cancelRequest)
            .then((response) => {
                if (response.status === 200 || response.status === 201) {
                    notification.success({
                        message: '成功', description: '资源注销成功。',
                    });
                    form.resetFields(['city', 'unit', 'second_unit', 'service', 'commit_id', 'usingfor', 'payment', 'client', 'client_phone', 'format', 'system', 'ssd', 'hdd', 'rds_storage', 'oss_storage', 'ip', 'eip', 'start_time', 'addFee', 'comment']);
                    setFormatList([]);
                    setVisibleFields({}); // 取消时清空字段的可见性
                    setIsChangeModalOpen(false);
                    setRefresh(refresh + 1)
                } else {
                    notification.error({
                        message: '失败', description: '注销失败。',
                    });
                }
            })
            .catch((error) => {
                console.error("Error sending the request:", error);
                notification.error({
                    message: '错误', description: '发生了错误，请稍后再试。',
                });
            })
            .finally(() => {
                setConfirmLoading(false);
            });
        setRefresh(refresh + 1)
        setConfirmLoading(false)
        setIsCancelModalOpen(false)
    }
    const handleCancelCancel = () => {
        setIsCancelModalOpen(false)
        setModifyRequest({})
        form.resetFields(['city', 'unit', 'second_unit', 'service', 'commit_id', 'usingfor', 'payment', 'client', 'client_phone', 'format', 'system', 'ssd', 'hdd', 'rds_storage', 'oss_storage', 'ip', 'eip', 'changed_time', 'addFee', 'comment']);


    }

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
    const handleCancel = async (key) => {
        setIsCancelModalOpen(true)
        // 处理注销按钮点击事件
        message.info(`注销操作，Key: ${key}`);
        setSelectKey(key)
        try {
            axios.get("/yd_xc/api/GetAddFee", {params: {addVersion}}) // 带上 version 参数
                .then((response) => {
                    setAddFee(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching the AddFee data:", error);
                })
            // 请求数据
            const response = await axios.get(`/yd_xc/api/getCostByKey`, {
                params: {key}
            });

            // 获取返回的数据
            const data = response.data;

            // 解析 add_fee 字段
            let parsedAddFee = [];
            if (data.add_fee) {
                try {
                    const addFeeObject = JSON.parse(data.add_fee);
                    parsedAddFee = addFeeObject.add_fee.map(fee => {
                        const [add_product, count] = Object.entries(fee)[0];
                        return {
                            add_product: parseInt(add_product, 10), count
                        };
                    });
                } catch (error) {
                    console.error('解析 add_fee 数据失败:', error);
                    message.error('解析附加费用数据失败');
                }
            }

            // 设置表单字段的值
            form.setFieldsValue({
                city: data.city || '',
                unit: data.unit || '',
                second_unit: data.second_unit || '',
                service: data.service || '',
                commit_id: data.commit_id || '',
                usingfor: data.usingfor || '',
                product: data.resource_type || '',
                payment: data.payment || '',
                format: data.subject || '',
                system: data.system || '',
                ssd: data.ssd || 0,
                hdd: data.hdd || 0,
                rds_storage: data.rds_storage || 0,
                oss_storage: data.oss_storage || 0,
                ip: data.ip || '',
                eip: data.eip || '',
                changed_time: currentDay ? dayjs(data.changed_time) : null,
                addFee: parsedAddFee
            });

            const productBack = data.resource_type;
            axios.get('/yd_xc/api/getFormatsByProduct', {params: {product: productBack}})
                .then(response => {
                    const formats = response.data.map(format => ({
                        title: format.label, value: format.value,
                    }));
                    setFormatList(formats);
                    console.log(formatList);
                })
                .catch(error => {
                    console.error('获取格式数据失败:', error);
                });

        } catch (error) {
            console.error('Error fetching cost data:', error);
            message.error('获取变配数据失败');
        }
    };

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
                const response = await axios.post('/yd_xc/api/DescribeCost', PostBody);
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

    }, [props.Version, props.Project, costMonth, searchValue, searchOption, refresh]);


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
                    <AddResourceButton year_version={props.year_version} refresh={refresh} setRefresh={setRefresh}/>
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
            <Modal title="变更资源计费" open={isChangeModalOpen} onOk={handleChangeOK} onCancel={handleChangeCancel}
                   style={{minWidth: "170vh"}} confirmLoading={confirmLoading} okText="变更">
                <Form form={form} layout="horizontal" autoComplete="off"
                      style={{
                          marginLeft: "10vh",
                          marginRight: "10vh",
                          marginTop: "5vh",
                          marginBottom: "5vh",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-around"
                      }}>
                    <div style={{margin: "0.25rem", minWidth: "40vh"}}>
                        <Form.Item name="city" label="市辖区" rules={[{required: true, message: '请选择市辖区'}]}>
                            <Input disabled/>
                        </Form.Item>
                        <Form.Item name="unit" label="单位" rules={[{required: true, message: '请选择单位'}]}>
                            <Input disabled/>
                        </Form.Item>
                        <Form.Item name="second_unit" label="二级单位"
                                   rules={[{required: true, message: '请选择二级单位'}]}>
                            <Input disabled/>
                        </Form.Item>
                        <Form.Item name="service" label="系统名"
                                   rules={[{required: true, message: '请选择系统名'}]}>
                            <Input disabled/>
                        </Form.Item>
                        <Form.Item name="commit_id" label="申请单号"
                                   rules={[{required: true, message: '请输入申请单号'}]}>
                            <Input/>
                        </Form.Item>
                        <Form.Item name="usingfor" label="实例名称"
                                   rules={[{required: true, message: '请输入实例名称'}]}>
                            <Input disabled/>
                        </Form.Item>
                        <Form.Item name="product" label="资源类型"
                                   rules={[{required: true, message: '请选择资源类型'}]}>
                            <Input disabled/>
                        </Form.Item>
                        <Form.Item name="payment" label="支付单位"
                                   rules={[{required: true, message: '请输入支付单位'}]}>
                            <Input disabled/>
                        </Form.Item>
                    </div>
                    <div style={{margin: "5vh", minWidth: "40vh"}}>
                        <Form.Item name="format" label="规格" rules={[{required: true, message: '请选择规格'}]}>
                            <Select placeholder="请选择规格" disabled={!formatList.length}>
                                {formatList.map(format => (
                                    <Option key={format.value} value={format.value}>{format.title}</Option>))}
                            </Select>
                        </Form.Item>
                        {visibleFields.system !== false && (<Form.Item name="system" label="操作系统"
                                                                       rules={[{
                                                                           required: true, message: '请输入操作系统'
                                                                       }]}>
                            <Input/>
                        </Form.Item>)}
                        {visibleFields.ssd !== false && (<Form.Item name="ssd" label="(SSD)数据盘">
                            <InputNumber min={0} defaultValue={0} max={32768}/>
                        </Form.Item>)}
                        {visibleFields.hdd !== false && (<Form.Item name="hdd" label="高效云盘数据盘">
                            <InputNumber min={0} defaultValue={0} max={32768}/>GB
                        </Form.Item>)}
                        {visibleFields.rds_storage !== false && (<Form.Item name="rds_storage" label="云数据库存储">
                            <InputNumber min={0} defaultValue={0} max={32768}/>GB
                        </Form.Item>)}
                        {visibleFields.oss_storage !== false && (<Form.Item name="oss_storage" label="对象存储存储">
                            <InputNumber min={0} defaultValue={0} max={32768}/>GB
                        </Form.Item>)}
                        {visibleFields.ip !== false && (
                            <Form.Item name="ip" label="IP地址" rules={[{required: true, message: '请输入IP地址'}]}>
                                <Input/>
                            </Form.Item>)}
                        {visibleFields.eip !== false && (<Form.Item name="eip" label="弹性IP地址">
                            <Input/>
                        </Form.Item>)}
                        <Form.Item name="changed_time" label="变配日期"
                                   rules={[{
                                       required: true, message: '请选择变配日期'
                                   }]}>
                            <DatePicker picker="date"/>
                        </Form.Item>
                        <Form.Item name="comment" label="备注"
                                   rules={[{
                                       required: true, message: '请填入备注'
                                   }]}>
                            <Input/>
                        </Form.Item>

                    </div>
                    <div style={{margin: "0.25rem", minWidth: "40vh"}}>
                        <h4 style={{color: "red"}}>如果资源类型为ECS、OSS或RDS请保留对应的默认安全费用</h4>
                        <Form.List name="addFee">
                            {(fields, {add, remove}) => (<>
                                <div style={{
                                    maxHeight: '300px', overflowY: 'auto', marginBottom: '16px'
                                }}> {/* 添加这个div容器 */}
                                    {fields.map(({key, name, ...restField}) => (<Space key={key} style={{
                                        display: 'flex',
                                        marginBottom: 8,
                                        justifyContent: "space-between",
                                        width: "100%",
                                        alignItems: "center"
                                    }} align="center">

                                        <Form.Item
                                            {...restField}
                                            name={[name, 'add_product']}
                                            rules={[{required: true, message: '缺少额外计费选项'}]}
                                            style={{flex: 1, marginBottom: 0}}
                                        >
                                            <Select options={addFee} style={{minWidth: "150px"}}/>
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'count']}
                                            rules={[{required: true, message: '缺少计数'}]}
                                            style={{flex: 1, marginBottom: 0}}
                                        >
                                            <InputNumber style={{width: "100%"}}/>
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)}/>
                                    </Space>))}
                                </div>
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined/>}>
                                        增加额外计费
                                    </Button>
                                </Form.Item>
                            </>)}
                        </Form.List>
                    </div>
                </Form>
            </Modal>
            <Modal title="变更资源计费" open={isCancelModalOpen} onOk={handleCancelOK} onCancel={handleCancelCancel}
                   style={{minWidth: "170vh"}} confirmLoading={confirmLoading} okText="注销">
                <Form form={form} layout="horizontal" autoComplete="off"
                      style={{
                          marginLeft: "10vh",
                          marginRight: "10vh",
                          marginTop: "5vh",
                          marginBottom: "5vh",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-around"
                      }}>
                    <div style={{margin: "0.25rem", minWidth: "40vh"}}>
                        <Form.Item name="city" label="市辖区" rules={[{required: true, message: '请选择市辖区'}]}>
                            <Input disabled/>
                        </Form.Item>
                        <Form.Item name="unit" label="单位" rules={[{required: true, message: '请选择单位'}]}>
                            <Input disabled/>
                        </Form.Item>
                        <Form.Item name="second_unit" label="二级单位"
                                   rules={[{required: true, message: '请选择二级单位'}]}>
                            <Input disabled/>
                        </Form.Item>
                        <Form.Item name="service" label="系统名"
                                   rules={[{required: true, message: '请选择系统名'}]}>
                            <Input disabled/>
                        </Form.Item>
                        <Form.Item name="commit_id" label="申请单号"
                                   rules={[{required: true, message: '请输入申请单号'}]}>
                            <Input disabled/>
                        </Form.Item>
                        <Form.Item name="usingfor" label="实例名称"
                                   rules={[{required: true, message: '请输入实例名称'}]}>
                            <Input disabled/>
                        </Form.Item>
                        <Form.Item name="product" label="资源类型"
                                   rules={[{required: true, message: '请选择资源类型'}]}>
                            <Input disabled/>
                        </Form.Item>
                        <Form.Item name="payment" label="支付单位"
                                   rules={[{required: true, message: '请输入支付单位'}]}>
                            <Input disabled/>
                        </Form.Item>
                    </div>
                    <div style={{margin: "5vh", minWidth: "40vh"}}>
                        <Form.Item name="format" label="规格" rules={[{required: true, message: '请选择规格'}]}>
                            <Select placeholder="请选择规格" disabled>
                                {formatList.map(format => (
                                    <Option key={format.value} value={format.value}>{format.title}</Option>))}
                            </Select>
                        </Form.Item>
                        {visibleFields.system !== false && (<Form.Item name="system" label="操作系统"
                                                                       rules={[{
                                                                           required: true, message: '请输入操作系统'
                                                                       }]}>
                            <Input disabled/>
                        </Form.Item>)}
                        {visibleFields.ssd !== false && (<Form.Item name="ssd" label="(SSD)数据盘">
                            <InputNumber disabled min={0} defaultValue={0} max={32768}/>
                        </Form.Item>)}
                        {visibleFields.hdd !== false && (<Form.Item name="hdd" label="高效云盘数据盘">
                            <InputNumber disabled min={0} defaultValue={0} max={32768}/>GB
                        </Form.Item>)}
                        {visibleFields.rds_storage !== false && (<Form.Item name="rds_storage" label="云数据库存储">
                            <InputNumber disabled min={0} defaultValue={0} max={32768}/>GB
                        </Form.Item>)}
                        {visibleFields.oss_storage !== false && (<Form.Item name="oss_storage" label="对象存储存储">
                            <InputNumber disabled min={0} defaultValue={0} max={32768}/>GB
                        </Form.Item>)}
                        {visibleFields.ip !== false && (
                            <Form.Item name="ip" label="IP地址" rules={[{required: true, message: '请输入IP地址'}]}>
                                <Input disabled/>
                            </Form.Item>)}
                        {visibleFields.eip !== false && (<Form.Item name="eip" label="弹性IP地址">
                            <Input disabled/>
                        </Form.Item>)}
                        <Form.Item name="changed_time" label="注销日期"
                                   rules={[{
                                       required: true, message: '请选择注销日期'
                                   }]}>
                            <DatePicker picker="date"/>
                        </Form.Item>
                    </div>
                    <div style={{margin: "0.25rem", minWidth: "40vh"}}>
                        <h4 style={{color: "red"}}>如果资源类型为ECS、OSS或RDS请保留对应的默认安全费用</h4>
                        <Form.List name="addFee">
                            {(fields, {add, remove}) => (<>
                                <div style={{
                                    maxHeight: '300px', overflowY: 'auto', marginBottom: '16px'
                                }}> {/* 添加这个div容器 */}
                                    {fields.map(({key, name, ...restField}) => (<Space key={key} style={{
                                        display: 'flex',
                                        marginBottom: 8,
                                        justifyContent: "space-between",
                                        width: "100%",
                                        alignItems: "center"
                                    }} align="center">

                                        <Form.Item
                                            {...restField}
                                            name={[name, 'add_product']}
                                            rules={[{required: true, message: '缺少额外计费选项'}]}
                                            style={{flex: 1, marginBottom: 0}}
                                        >
                                            <Select options={addFee} disabled style={{minWidth: "150px"}}/>
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'count']}
                                            rules={[{required: true, message: '缺少计数'}]}
                                            style={{flex: 1, marginBottom: 0}}
                                        >
                                            <InputNumber disabled style={{width: "100%"}}/>
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)}/>
                                    </Space>))}
                                </div>
                                <Form.Item>
                                    <Button type="dashed" disabled onClick={() => add()} block icon={<PlusOutlined/>}>
                                        增加额外计费
                                    </Button>
                                </Form.Item>
                            </>)}
                        </Form.List>
                        <Form.Item name="comment" label="备注"
                                   rules={[{
                                       required: true, message: '请填入备注'
                                   }]}>
                            <Input/>
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
            {/*<Table*/}
            {/*    columns={TableColumn}*/}
            {/*    dataSource={tableData}*/}
            {/*    scroll={{*/}
            {/*        x: 1500, y: "72.5vh"*/}
            {/*    }}*/}
            {/*    loading={TableLoading}*/}
            {/*    sticky={{*/}
            {/*        offsetHeader: 64,*/}
            {/*    }}*/}
            {/*/>*/}
            {TableLoading ? (<Spin size="large" style={{marginTop: 250}}/>) : (<Table
                columns={TableColumn}
                dataSource={tableData}
                scroll={{x: 1500, y: "72.5vh"}}
                sticky={{offsetHeader: 64}}
            />)}
        </div>
    </>);
};

export default CostTable;
