import React, {useEffect, useState} from "react";
import {Button, DatePicker, Form, Input, InputNumber, Modal, notification, Select, Space} from "antd";
import axios from "axios";
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";

const {Option} = Select;

const AddButton = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();

    const [cityList, setCityList] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const [secondUnitList, setSecondUnitList] = useState([]);
    const [serviceList, setServiceList] = useState([]);
    const [formatList, setFormatList] = useState([]);
    const [addFee, setAddFee] = useState([]);
    const [visibleFields, setVisibleFields] = useState({});
    const [addRequest, setAddRequest] = useState({});
    const [addVersion, setAddVersion] = useState('2024');


    const second_unit = Form.useWatch('second_unit', form);
    const service = Form.useWatch('service', form);
    const usingfor = Form.useWatch('usingfor', form);
    const commit_id = Form.useWatch('commit_id', form);
    const payment = Form.useWatch('payment', form);
    const productValue = Form.useWatch('product', form);
    const client = Form.useWatch('client', form);
    const client_phone = Form.useWatch('client_phone', form);
    const format = Form.useWatch('format', form);
    const system = Form.useWatch('system', form);
    const ssd = Form.useWatch('ssd', form);
    const hdd = Form.useWatch('hdd', form);
    const rds_storage = Form.useWatch('rds_storage', form);
    const oss_storage = Form.useWatch('oss_storage', form);
    const ip = Form.useWatch('ip', form);
    const eip = Form.useWatch('eip', form);
    const start_time = Form.useWatch('start_time', form);
    const addFeeValue = Form.useWatch('addFee', form);


    const {version} = props;
    const resourceType = [{
        label: <span>计算</span>, title: 'compute', options: [{label: <span>ECS云服务器</span>, value: 'ECS'},],
    }, {
        label: <span>数据库</span>,
        title: 'database',
        options: [{label: <span>RDS</span>, value: 'RDS'}, {label: <span>PolarDB</span>, value: 'PolarDB'},],
    }, {
        label: <span>存储</span>, title: 'storage', options: [{label: <span>OSS对象存储</span>, value: 'OSS'},],
    }, {
        label: <span>网络服务</span>, title: 'network', options: [{label: <span>SLB负载均衡</span>, value: 'SLB'},],
    },];

    useEffect(() => {setAddVersion(props.version)},[props.version])
    useEffect(() => {
        form.setFieldsValue({product: 'ECS'});
        // Fetch the tree data
        axios.get("http://127.0.0.1:5000/getServiceByTree")
            .then((response) => {
                setCityList(response.data);
            })
            .catch((error) => {
                console.error("Error fetching the tree data:", error);
            });
        console.log("version", version);
        axios.get("http://127.0.0.1:5000/GetAddFee", {params: {addVersion}}) // 带上 version 参数
            .then((response) => {
                setAddFee(response.data);
            })
            .catch((error) => {
                console.error("Error fetching the AddFee data:", error);
            })
        setVisibleFields({
            rds_storage: false,
            oss_storage: false,
            system: true,
            ssd: true,
            hdd: true,
            ip: true,
            eip: true,
            start_time: true,
        });
    }, []);

    const onCityChange = (value) => {
        const selectedCity = cityList.find(city => city.value === value);
        setUnitList(selectedCity?.children || []);
        form.resetFields(['unit', 'second_unit', 'service']);
        setSecondUnitList([]);
        setServiceList([]);
    };


    const onUnitChange = (value) => {
        const selectedUnit = unitList.find(unit => unit.value === value);
        setSecondUnitList(selectedUnit?.children || []);
        form.resetFields(['second_unit', 'service']);
        setServiceList([]);
    };

    const onSecondUnitChange = (value) => {
        const selectedSecondUnit = secondUnitList.find(secondUnit => secondUnit.value === value);
        setServiceList(selectedSecondUnit?.children || []);
        form.resetFields(['service']);
    };
    useEffect(() => {
        // Fetch format list based on product value
        axios.get("http://127.0.0.1:5000/getFormatsByProduct", {params: {product: productValue}})
            .then((response) => {
                setFormatList(response.data); // Update format list
                form.resetFields(['format']); // Reset format selection
            })
            .catch((error) => {
                console.error("Error fetching format data:", error);
                setFormatList([]); // Clear format list on error
            });
    }, [productValue]); // Only re-run when productValue changes

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
                    start_time: true,
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
                    start_time: true,
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
                    start_time: true,
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
                    start_time: true,
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
                    start_time: true,
                });
                break;
        }
    }, [productValue]); // Only re-run when productValue changes

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

        const addrq = {
            "service_unit": second_unit,
            "service": service,
            "usingfor": usingfor,
            "commit_id": commit_id,
            "payment": payment,
            "client": client,
            "client_phone": client_phone,
            "system": system,
            "ip": ip,
            "eip": eip,
            "start_time": start_time,
            "bill_subject": format,
            "ssd": ssd,
            "hdd": hdd,
            "rds_storage": rds_storage,
            "oss_storage": oss_storage,
            "addFee": formattedAddFee,
        };
        console.log("添加请求字段:", addrq);
        setAddRequest(addrq);
    }, [second_unit, service, commit_id, usingfor, productValue, system, ip, eip, start_time, format, ssd, hdd, rds_storage, oss_storage, addFeeValue]);


    // Only re-run when these fields change

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setConfirmLoading(true);

        axios.post("http://127.0.0.1:5000/CreateCost", addRequest)
            .then((response) => {
                if (response.status === 200 || response.status === 201) {
                    notification.success({
                        message: '成功',
                        description: '资源创建成功。',
                    });
                    form.resetFields(['city', 'unit', 'second_unit', 'service', 'commit_id', 'usingfor', 'payment', 'client', 'client_phone', 'format', 'system', 'ssd', 'hdd', 'rds_storage', 'oss_storage', 'ip', 'eip', 'start_time', 'addFee']);
                    setUnitList([]);
                    setSecondUnitList([]);
                    setServiceList([]);
                    setFormatList([]);
                    setVisibleFields({}); // 取消时清空字段的可见性
                    setIsModalOpen(false);
                } else {
                    notification.error({
                        message: '失败',
                        description: '资源创建失败。',
                    });
                }
            })
            .catch((error) => {
                console.error("Error sending the request:", error);
                notification.error({
                    message: '错误',
                    description: '发生了错误，请稍后再试。',
                });
            })
            .finally(() => {
                setConfirmLoading(false);
            });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields(['city', 'unit', 'second_unit', 'service', 'commit_id', 'usingfor', 'payment', 'client', 'client_phone', 'format', 'system', 'ssd', 'hdd', 'rds_storage', 'oss_storage', 'ip', 'eip', 'start_time', 'addFee']);
        setUnitList([]);
        setSecondUnitList([]);
        setServiceList([]);
        setFormatList([]);
        setVisibleFields({}); // 取消时清空字段的可见性
    };

    return (<>
        <Button type="primary" onClick={showModal} style={{margin: "0.25rem"}}>添加</Button>
        <Modal title="创建资源计费" open={isModalOpen} onOk={handleCreate} onCancel={handleCancel}
               style={{minWidth: "170vh"}} confirmLoading={confirmLoading} okText="创建">
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
                        <Select placeholder="请选择市辖区" onChange={onCityChange}>
                            {cityList.map(city => (<Option key={city.value} value={city.value}>{city.title}</Option>))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="unit" label="单位" rules={[{required: true, message: '请选择单位'}]}>
                        <Select placeholder="请选择单位" onChange={onUnitChange} disabled={!unitList.length}>
                            {unitList.map(unit => (<Option key={unit.value} value={unit.value}>{unit.title}</Option>))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="second_unit" label="二级单位"
                               rules={[{required: true, message: '请选择二级单位'}]}>
                        <Select placeholder="请选择二级单位" onChange={onSecondUnitChange}
                                disabled={!secondUnitList.length}>
                            {secondUnitList.map(secondUnit => (<Option key={secondUnit.value}
                                                                       value={secondUnit.value}>{secondUnit.title}</Option>))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="service" label="系统名" rules={[{required: true, message: '请选择系统名'}]}>
                        <Select placeholder="请选择系统名" disabled={!serviceList.length}>
                            {serviceList.map(service => (
                                <Option key={service.value} value={service.value}>{service.title}</Option>))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="commit_id" label="申请单号"
                               rules={[{required: true, message: '请输入申请单号'}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="usingfor" label="实例名称"
                               rules={[{required: true, message: '请输入实例名称'}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="product" label="资源类型"
                               rules={[{required: true, message: '请选择资源类型'}]}>
                        <Select
                            style={{width: 200}}
                            options={resourceType}
                        />
                    </Form.Item>
                    <Form.Item name="payment" label="支付单位"
                               rules={[{required: true, message: '请输入支付单位'}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="client" label="客户姓名"
                               rules={[{required: true, message: '请输入客户姓名'}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="client_phone" label="客户联系方式"
                               rules={[{required: true, message: '请输入客户联系方式'}]}>
                        <Input/>
                    </Form.Item>
                </div>
                <div style={{margin: "5vh", minWidth: "40vh"}}>
                    <Form.Item name="format" label="规格" rules={[{required: true, message: '请选择规格'}]}>
                        <Select placeholder="请选择规格" disabled={!formatList.length}>
                            {formatList.map(format => (
                                <Option key={format.value} value={format.value}>{format.title}</Option>))}
                        </Select>
                    </Form.Item>
                    {visibleFields.system !== false && (
                        <Form.Item name="system" label="操作系统" rules={[{required: true, message: '请输入操作系统'}]}>
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
                    {visibleFields.start_time !== false && (<Form.Item name="start_time" label="开通日期"
                                                                       rules={[{
                                                                           required: true, message: '请选择开通日期'
                                                                       }]}>
                        <DatePicker picker="date"/>
                    </Form.Item>)}
                </div>
                <div style={{margin: "0.25rem", minWidth: "40vh"}}>
                    <h4 style={{color: "red"}}>如果资源类型为ECS、OSS或RDS请选择对应的默认安全费用</h4>
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
    </>);

};

export default AddButton;
