import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Popconfirm, Table, Typography, Button, Select, message } from 'antd';
import axios from 'axios';

const { Option } = Select;

const EditableCell = ({
                          editing, dataIndex, title, inputType, record, index, children, ...restProps
                      }) => {
    const [selectOptions, setSelectOptions] = useState([]);

    useEffect(() => {
        if (dataIndex === 'version') {
            axios.get('/yd_zwy/api/GetYearVersion')
                .then(response => {
                    setSelectOptions(response.data);
                })
                .catch(error => {
                    console.error('获取版本数据时发生错误！', error);
                });
        }
    }, [dataIndex]);

    const inputNode = inputType === 'number'
        ? <InputNumber />
        : inputType === 'select'
            ? <Select>
                {selectOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                        {option.label}
                    </Option>
                ))}
            </Select>
            : <Input />;

    return (
        <td {...restProps}>
            {editing && dataIndex !== 'operation' ? (
                <Form.Item
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[{ required: true, message: `请输入${title}!` }]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

const PriceTable = () => {
    const [form] = Form.useForm();
    const [data, setData] = useState([]);
    const [editingKey, setEditingKey] = useState('');
    const [addForm] = Form.useForm();
    const [versions, setVersions] = useState([]);

    useEffect(() => {
        // 获取价格数据
        axios.get('/yd_zwy/api/DescribePrice')
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('获取数据时发生错误！', error);
            });

        // 获取版本数据
        axios.get('/yd_zwy/api/GetYearVersion')
            .then(response => {
                setVersions(response.data);
            })
            .catch(error => {
                console.error('获取版本数据时发生错误！', error);
            });
    }, []);

    const isEditing = (record) => record.key === editingKey;

    const edit = (record) => {
        form.setFieldsValue({
            project: '',
            billing: '',
            format_name: '',
            format: '',
            price: '',
            price_with_elect: '',
            version: '',
            ...record,
        });
        setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async (key) => {
        try {
            const row = await form.validateFields();
            const updatedRecord = { ...row, key };

            await axios.put(`/yd_zwy/api/UpdatePrice/${key}`, updatedRecord);

            const newData = [...data];
            const index = newData.findIndex((item) => key === item.key);
            if (index > -1) {
                newData.splice(index, 1, updatedRecord);
                setData(newData);
            } else {
                newData.push(updatedRecord);
                setData(newData);
            }
            setEditingKey('');
            message.success('记录更新成功！');
        } catch (errInfo) {
            console.log('验证失败:', errInfo);
            message.error('记录更新失败。');
        }
    };

    const deletePrice = async (key) => {
        try {
            await axios.delete(`/yd_zwy/api/DeletePrice/${key}`);
            setData(data => data.filter(item => item.key !== key));  // 更新状态时使用函数形式
            message.success('记录删除成功！');
        } catch (error) {
            console.error('删除记录失败', error);
            message.error('删除记录失败。');
        }
    };


    const addNewPrice = async () => {
        try {
            const values = await addForm.validateFields();
            const response = await axios.post('/yd_zwy/api/AddPrice', values);

            if (response.data.success) {
                setData([...data, { ...response.data.data, key: response.data.data.uuid }]);
                addForm.resetFields();
                message.success('价格记录添加成功！');
            } else {
                message.error('添加价格记录失败。');
            }
        } catch (error) {
            console.error('添加价格记录失败', error);
            message.error('添加价格记录失败。');
        }
    };

    const columns = [
        { title: '资源类型', dataIndex: 'project', width: '5%', editable: true },
        { title: '资源项', dataIndex: 'billing', width: '10%', editable: true },
        { title: '资源名称', dataIndex: 'format_name', width: '20%', editable: true },
        { title: '计费规格', dataIndex: 'format', width: '10%', editable: true },
        { title: '价格', dataIndex: 'price', width: '10%', editable: true, inputType: 'number' },
        { title: '含电价', dataIndex: 'price_with_elect', width: '10%', editable: true, inputType: 'number' },
        {
            title: '版本',
            dataIndex: 'version',
            width: '10%',
            editable: true,
            inputType: 'select',
            render: (value) => {
                const version = versions.find(v => v.value === value);
                return version ? version.label : value;
            }
        },
        {
            title: '操作',
            dataIndex: 'operation',
            width: '15%',
            render: (_, record) => {
                const editable = isEditing(record);
                return (
                    <span>
                        {editable ? (
                            <>
                                <Typography.Link
                                    onClick={() => save(record.key)}
                                    style={{ marginInlineEnd: 8 }}
                                >
                                    保存
                                </Typography.Link>
                                <Popconfirm title="确定取消吗？" onConfirm={cancel}>
                                    <a>取消</a>
                                </Popconfirm>
                            </>
                        ) : (
                            <>
                                <Typography.Link
                                    disabled={editingKey !== ''}
                                    onClick={() => edit(record)}
                                    style={{ marginInlineEnd: 8 }}
                                >
                                    编辑
                                </Typography.Link>
                                <Popconfirm title="确定删除吗？" onConfirm={() => deletePrice(record.key)}>
                                    <a>删除</a>
                                </Popconfirm>
                            </>
                        )}
                    </span>
                );
            },
        },
    ];

    const mergedColumns = columns.map((col) => ({
        ...col,
        onCell: (record) => ({
            record,
            inputType: col.inputType || 'text',
            dataIndex: col.dataIndex,
            title: col.title,
            editing: isEditing(record),
        }),
    }));

    return (
        <>
            <Form form={addForm} layout="inline" style={{margin:"10px"}}>
                <Form.Item
                    name="project"
                    label="项目"
                    rules={[{ required: true, message: '请输入项目名称!' }]}
                >
                    <Input placeholder="项目" />
                </Form.Item>
                <Form.Item
                    name="billing"
                    label="计费方式"
                    rules={[{ required: true, message: '请输入计费方式!' }]}
                >
                    <Input placeholder="计费方式" />
                </Form.Item>
                <Form.Item
                    name="format_name"
                    label="格式名称"
                    rules={[{ required: true, message: '请输入格式名称!' }]}
                >
                    <Input placeholder="格式名称" />
                </Form.Item>
                <Form.Item
                    name="format"
                    label="格式"
                    rules={[{ required: true, message: '请输入格式!' }]}
                >
                    <Input placeholder="格式" />
                </Form.Item>
                <Form.Item
                    name="price"
                    label="价格"
                    rules={[{ required: true, message: '请输入价格!' }]}
                >
                    <InputNumber placeholder="价格" min={0} />
                </Form.Item>
                <Form.Item
                    name="price_with_elect"
                    label="含电价"
                    rules={[{ required: true, message: '请输入含电价!' }]}
                >
                    <InputNumber placeholder="含电价" min={0}/>
                </Form.Item>
                <Form.Item
                    name="version"
                    label="版本"
                    rules={[{ required: true, message: '请选择版本!' }]}
                >
                    <Select placeholder="选择版本">
                        {versions.map(version => (
                            <Option key={version.value} value={version.value}>
                                {version.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={addNewPrice}>
                        添加价格记录
                    </Button>
                </Form.Item>
            </Form>
            <Form form={form} component={false}>
                <Table
                    components={{ body: { cell: EditableCell } }}
                    bordered
                    dataSource={data}
                    columns={mergedColumns}
                    rowClassName="editable-row"
                    pagination={{ onChange: cancel }}
                    rowKey="key"
                />
            </Form>
        </>
    );
};

export default PriceTable;
