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
            axios.get('http://127.0.0.1:5000/GetYearVersion')
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

const AddFeeTable = () => {
    const [form] = Form.useForm();
    const [data, setData] = useState([]);
    const [editingKey, setEditingKey] = useState('');
    const [addForm] = Form.useForm();
    const [versions, setVersions] = useState([]);

    useEffect(() => {
        // 获取 AddFee 数据
        axios.get('http://127.0.0.1:5000/DescribeAddFee')
            .then(response => {
                setData(response.data.map(item => ({ ...item, key: item.id }))); // 使用 id 作为 key
            })
            .catch(error => {
                console.error('获取数据时发生错误！', error);
            });

        // 获取版本数据
        axios.get('http://127.0.0.1:5000/GetYearVersion')
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
            product: '',
            price: '',
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
            const updatedRecord = { ...row, id: key }; // 使用 id 替代 key

            await axios.put(`http://127.0.0.1:5000/UpdateAddFee/${key}`, updatedRecord);

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

    const deleteAddFee = async (key) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/DeleteAddFee/${key}`);
            setData(data.filter(item => item.key !== key));
            message.success('记录删除成功！');
        } catch (error) {
            console.error('删除记录失败', error);
            message.error('删除记录失败。');
        }
    };

    const addNewAddFee = async () => {
        try {
            const values = await addForm.validateFields();
            const response = await axios.post('http://127.0.0.1:5000/AddAddFee', values);
            const newRecord = response.data.data;
            setData([...data, { ...newRecord, key: newRecord.id }]); // 使用返回的 id 设置 key
            addForm.resetFields();
            message.success('费用记录添加成功！');
        } catch (error) {
            console.error('添加费用记录失败', error);
            message.error('添加费用记录失败。');
        }
    };


    const columns = [
        { title: '产品', dataIndex: 'product', width: '30%', editable: true },
        { title: '价格', dataIndex: 'price', width: '20%', editable: true, inputType: 'number' },
        {
            title: '版本',
            dataIndex: 'version',
            width: '20%',
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
            width: '30%',
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
                                <Popconfirm title="确定删除吗？" onConfirm={() => deleteAddFee(record.key)}>
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
            <Form form={addForm} layout="inline" style={{ margin: "10px" }}>
                <Form.Item
                    name="product"
                    label="产品"
                    rules={[{ required: true, message: '请输入产品名称!' }]}
                >
                    <Input placeholder="产品" />
                </Form.Item>
                <Form.Item
                    name="price"
                    label="价格"
                    rules={[{ required: true, message: '请输入价格!' }]}
                >
                    <InputNumber placeholder="价格" />
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
                    <Button type="primary" onClick={addNewAddFee}>
                        添加费用记录
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
                />
            </Form>
        </>
    );
};

export default AddFeeTable;
