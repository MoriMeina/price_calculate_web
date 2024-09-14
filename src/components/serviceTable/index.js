import React, {useEffect, useState} from 'react';
import {AutoComplete, Button, Form, Input, message, Modal, Popconfirm, Table} from 'antd';
import axios from 'axios';

const EditableCell = ({editing, dataIndex, title, inputType, record, index, children, ...restProps}) => {
    const inputNode = <Input/>;
    return (<td {...restProps}>
        {editing ? (<Form.Item
            name={dataIndex}
            style={{margin: 0}}
            rules={[{required: true, message: `请输入 ${title}`}]}
        >
            {inputNode}
        </Form.Item>) : (children)}
    </td>);
};

const ServiceTable = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [form] = Form.useForm();
    const [addForm] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [options, setOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [unitOptions, setUnitOptions] = useState([]);
    const [secondUnitOptions, setSecondUnitOptions] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [formDisabled, setFormDisabled] = useState({unit: true, second_unit: true});
    const pageSize = 10;

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        setFilteredData(data.slice(start, end));
    }, [data, currentPage]);

    useEffect(() => {
        // Fetch tree data from backend
        axios.get('/yd_zwy/api/getServiceByTree')
            .then(response => {
                const treeData = response.data;
                setOptions(treeData);
                setCityOptions(treeData.map(city => ({value: city.title, children: city.children})));
            })
            .catch(error => {
                console.error('Error fetching tree data', error);
                message.error('获取数据失败，请重试！');
            });
    }, []);

    // const handleCityChange = (value) => {
    //     const selectedCity = cityOptions.find(city => city.value === value);
    //     if (selectedCity) {
    //         setUnitOptions(selectedCity.children.map(unit => ({value: unit.title, children: unit.children})));
    //         setFormDisabled({unit: false, second_unit: true});
    //         form.setFieldsValue({unit: undefined, second_unit: undefined});
    //     }
    // };
    //
    // const handleUnitChange = (value) => {
    //     const selectedUnit = unitOptions.find(unit => unit.value === value);
    //     if (selectedUnit) {
    //         setSecondUnitOptions(selectedUnit.children.map(sUnit => ({value: sUnit.title})));
    //         setFormDisabled({unit: false, second_unit: false});
    //         form.setFieldsValue({second_unit: undefined});
    //     }
    // };

    const handleCityChange = (value) => {
        const selectedCity = cityOptions.find(city => city.value === value);
        if (selectedCity) {
            setUnitOptions(selectedCity.children.map(unit => ({value: unit.title, children: unit.children})));
            form.setFieldsValue({unit: undefined, second_unit: undefined});
        } else {
            setUnitOptions([]);
            form.setFieldsValue({unit: undefined, second_unit: undefined});
        }
    };

    const handleUnitChange = (value) => {
        const selectedUnit = unitOptions.find(unit => unit.value === value);
        if (selectedUnit) {
            setSecondUnitOptions(selectedUnit.children.map(sUnit => ({value: sUnit.title})));
            form.setFieldsValue({second_unit: undefined});
        } else {
            setSecondUnitOptions([]);
            form.setFieldsValue({second_unit: undefined});
        }
    };


    const handleAdd = async () => {
        try {
            const newEntry = await addForm.validateFields();

            // 调用后端添加接口
            axios.post('/yd_zwy/api/addService', newEntry)
                .then(() => {
                    fetchData();  // 重新获取数据
                    addForm.resetFields(); // 清空表单
                    setModalVisible(false); // 关闭 Modal
                    message.success('添加成功');
                })
                .catch(error => {
                    console.error('添加失败', error);
                    message.error('添加失败');
                });
        } catch (errInfo) {
            console.log('添加失败:', errInfo);
        }
    };

    const handleModalCancel = () => {
        addForm.resetFields(); // 清空表单
        setFormDisabled({unit: true, second_unit: true}); // 重置禁用状态
        setModalVisible(false); // 关闭 Modal
    };

    const fetchData = () => {
        axios.get('/yd_zwy/api/getService')
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('获取服务数据失败', error);
            });
    };

    const isEditing = (record) => record.uuid === editingKey;

    const edit = (record) => {
        form.setFieldsValue({
            city: '', unit: '', second_unit: '', service: '', client: '', client_phone: '', ...record,
        });
        setEditingKey(record.uuid);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async (uuid) => {
        try {
            const row = await form.validateFields();
            const newData = [...data];
            const index = newData.findIndex((item) => uuid === item.uuid);

            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {...item, ...row});
                setData(newData);
                setEditingKey('');

                // 调用后端更新接口
                axios.put(`/yd_zwy/api/updateService/${uuid}`, row)
                    .then(() => {
                        message.success('更新成功');
                    })
                    .catch(error => {
                        console.error('更新失败', error);
                        message.error('更新失败');
                    });
            } else {
                newData.push(row);
                setData(newData);
                setEditingKey('');
            }
        } catch (errInfo) {
            console.log('保存失败:', errInfo);
        }
    };

    const handleDelete = (uuid) => {
        axios.delete(`/yd_zwy/api/deleteService/${uuid}`)
            .then(() => {
                setData(data.filter(item => item.uuid !== uuid));
                message.success('删除成功');
                // 更新分页数据
                setCurrentPage(1);
            })
            .catch(error => {
                console.error('删除失败', error);
                message.error('删除失败');
            });
    };

    const columns = [{title: '城市', dataIndex: 'city', key: 'city', editable: true}, {
        title: '单位', dataIndex: 'unit', key: 'unit', editable: true
    }, {title: '二级单位', dataIndex: 'second_unit', key: 'second_unit', editable: true}, {
        title: '服务', dataIndex: 'service', key: 'service', editable: true
    }, {title: '客户', dataIndex: 'client', key: 'client', editable: true}, {
        title: '客户电话', dataIndex: 'client_phone', key: 'client_phone', editable: true
    }, {
        title: '操作', key: 'operation', render: (_, record) => {
            const editable = isEditing(record);
            return editable ? (<span>
                        <Button onClick={() => save(record.uuid)} style={{marginRight: 8}}>
                            保存
                        </Button>
                        <Popconfirm title="确定取消吗？" onConfirm={cancel}>
                            <Button>取消</Button>
                        </Popconfirm>
                    </span>) : (<span>
                        <Button type="link" disabled={editingKey !== ''} onClick={() => edit(record)}
                                style={{marginRight: 8}}>
                            编辑
                        </Button>
                        <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.uuid)}>
                            <Button type="link" disabled={editingKey !== ''}>删除</Button>
                        </Popconfirm>
                    </span>);
        },
    },];

    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col, onCell: (record) => ({
                record, inputType: 'text', dataIndex: col.dataIndex, title: col.title, editing: isEditing(record),
            }),
        };
    });

    return (<>
        <Button type="primary" onClick={() => setModalVisible(true)} style={{marginBottom: 16}}>
            添加服务
        </Button>
        <Form form={form} component={false}>
            <Table
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                bordered
                dataSource={filteredData}
                columns={mergedColumns}
                rowKey="uuid"
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: data.length,
                    onChange: (page) => setCurrentPage(page),
                }}
            />
        </Form>

        <Modal
            title="添加服务"
            visible={modalVisible}
            onCancel={handleModalCancel}
            footer={null}
            destroyOnClose
            style={{minWidth: "100vh"}}
        >
            <Form form={addForm} layout="horizontal" onFinish={handleAdd}>
                <div style={{
                    display: "flex", flexDirection: "row", marginTop: "35px", marginLeft: "20px", marginRight: "20px"
                }}>
                    <div style={{width: "50%", marginRight: "5px"}}>
                        <Form.Item name="city" label="区县" rules={[{required: true, message: '请输入区县'}]}>
                            <AutoComplete
                                options={cityOptions}
                                onChange={handleCityChange}
                                placeholder="区县"
                                filterOption={(inputValue, option) => option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1}
                                style={{width: "100%"}}
                            />
                        </Form.Item>
                        <Form.Item name="unit" label="单位" rules={[{required: true, message: '请输入单位'}]}>
                            <AutoComplete
                                options={unitOptions}
                                onChange={handleUnitChange}
                                placeholder="单位"
                                filterOption={(inputValue, option) => option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1}
                                style={{width: "100%"}}
                            />
                        </Form.Item>

                        <Form.Item name="second_unit" label="二级单位"
                                   rules={[{required: true, message: '请输入二级单位'}]}>
                            <AutoComplete
                                options={secondUnitOptions}
                                placeholder="二级单位"
                                filterOption={(inputValue, option) => option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1}
                                style={{width: "100%"}}
                            />
                        </Form.Item>
                    </div>
                    <div style={{width: "50%", marginLeft: "5px"}}>
                        <Form.Item name="service" label="服务(对应IRS系统)"
                                   rules={[{required: true, message: '请输入服务'}]}>
                            <Input placeholder="服务"/>
                        </Form.Item>
                        <Form.Item name="client" label="客户名" rules={[{required: true, message: '请输入客户'}]}>
                            <Input placeholder="客户"/>
                        </Form.Item>
                        <Form.Item name="client_phone" label="联系方式"
                                   rules={[{required: true, message: '请输入客户联系方式'}]}>
                            <Input placeholder="客户电话"/>
                        </Form.Item>
                    </div>
                </div>
                <div style={{display: "flex", justifyContent: "space-between", flexDirection: "row"}}>
                    <div></div>
                    <div>
                        <Form.Item>
                            <Button style={{marginRight: 8}} onClick={handleModalCancel}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit">
                                添加
                            </Button>
                        </Form.Item>
                    </div>
                </div>
            </Form>
        </Modal>
    </>);
};

export default ServiceTable;