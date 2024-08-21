import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Popconfirm, Table, Typography, Button, Select, message } from 'antd';
import axios from 'axios';

const { Option } = Select;

const EditableCell = ({
                          editing,
                          dataIndex,
                          title,
                          inputType,
                          record,
                          index,
                          children,
                          ...restProps
                      }) => {
    const inputNode = inputType === 'number'
        ? <InputNumber />
        : inputType === 'select'
            ? <Select>
                <Option value={true}>是</Option>
                <Option value={false}>否</Option>
            </Select>
            : <Input />;

    return (
        <td {...restProps}>
            {dataIndex === 'operation' ? (
                children
            ) : (
                editing ? (
                    <Form.Item
                        name={dataIndex}
                        style={{ margin: 0 }}
                        rules={[{ required: true, message: `请输入${title}!` }]}
                    >
                        {inputNode}
                    </Form.Item>
                ) : (
                    children
                )
            )}
        </td>
    );
};

const App = () => {
    const [form] = Form.useForm();
    const [data, setData] = useState([]);
    const [editingKey, setEditingKey] = useState('');
    const [addForm] = Form.useForm(); // 表单用于添加新记录

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/DescribeCity')
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('获取数据时发生错误！', error);
            });
    }, []);

    const isEditing = (record) => record.key === editingKey;
    const edit = (record) => {
        form.setFieldsValue({
            city: '',
            with_elect: '',
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

            await axios.put(`http://127.0.0.1:5000/UpdateCity/${key}`, updatedRecord);

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

    const addNewCity = async () => {
        try {
            const values = await addForm.validateFields();
            // 移除 uuid，因为数据库中由触发器生成 uuid
            const { uuid, ...dataToSend } = values;

            // 发送 POST 请求添加新城市
            const response = await axios.post('http://127.0.0.1:5000/AddCity', dataToSend);
            const responseData = response.data;

            if (responseData.success) {
                // 使用服务器返回的 uuid 更新数据
                const newRecord = { ...dataToSend, key: responseData.uuid };

                setData(prevData => [
                    ...prevData,
                    newRecord
                ]);
                addForm.resetFields(['city','with_elect']);
                message.success('城市添加成功！');

            } else {
                message.error('添加城市失败：' + (responseData.error || '未知错误'));
            }
        } catch (error) {
            console.error('添加城市失败', error);
            message.error('添加城市失败：' + (error.response?.data?.error || '未知错误'));
        }
    };



    const deleteCity = async (key) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/DeleteCity/${key}`);
            setData(data.filter(item => item.key !== key));
            message.success('城市删除成功！');
        } catch (error) {
            console.error('删除城市失败', error);
            message.error('删除城市失败。');
        }
    };

    const columns = [
        { title: '城市', dataIndex: 'city', width: '30%', editable: true },
        {
            title: '是否有电',
            dataIndex: 'with_elect',
            width: '30%',
            editable: true,
            render: (_, { with_elect }) => (with_elect ? '是' : '否')
        },
        {
            title: '操作',
            dataIndex: 'operation',
            width: '40%',
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
                                >
                                    编辑
                                </Typography.Link>
                                <Popconfirm
                                    title="确定删除这个城市吗？"
                                    onConfirm={() => deleteCity(record.key)}
                                >
                                    <a style={{ marginLeft: 8 }}>删除</a>
                                </Popconfirm>
                            </>
                        )}
                    </span>
                );
            }
        }
    ];

    const mergedColumns = columns.map((col) => ({
        ...col,
        onCell: (record) => ({
            record,
            inputType: col.dataIndex === 'with_elect' ? 'select' : 'text',
            dataIndex: col.dataIndex,
            title: col.title,
            editing: isEditing(record),
        }),
    }));

    return (
        <>
            <Form form={addForm} layout="inline" style={{ margin: 10 }}>
                <Form.Item
                    name="city"
                    label="城市"
                    rules={[{ required: true, message: '请输入城市!' }]}
                >
                    <Input placeholder="城市" />
                </Form.Item>
                <Form.Item name="with_elect" label="是否有电">
                    <Select placeholder="选择">
                        <Option value={true}>是</Option>
                        <Option value={false}>否</Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={addNewCity}>
                        添加城市
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

export default App;
