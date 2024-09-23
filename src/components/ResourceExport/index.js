import React, {useEffect, useState} from "react";
import {Button, DatePicker, Form, Input, Modal, Select, TreeSelect} from "antd";
import axios from "axios";
import ExcelJS from 'exceljs';

const ExportButton = () => {
    const {RangePicker} = DatePicker;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [treeData, setTreeData] = useState([]);
    const [versionData, setVersionData] = useState([]);
    const [selectedProject, setSelectedProject] = useState([]);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleExport = () => {
        setConfirmLoading(true);
        form.validateFields().then(values => {
            const requestData = {
                cost_month: values.dateRange.map(date => date.format('YYYY-MM')),
                service: selectedProject,
                year_version: values.version,
            };

            axios.post('/yd_xc/api/DescribeCost', requestData)
                .then(response => {
                    const data = response.data;

                    // 定义自定义表头
                    const customHeader = [
                        { title: '客户', dataIndex: 'client' },
                        { title: '手机号', dataIndex: 'client_phone' },
                        { title: '资源类型', dataIndex: 'resource_type' },
                        { title: '资源名', dataIndex: 'usingfor' },
                        { title: '单位', dataIndex: 'unit' },
                        { title: '二级单位', dataIndex: 'second_unit' },
                        { title: '支付方式', dataIndex: 'payment' },
                        { title: '申请单号', dataIndex: 'commit_id' },
                        { title: 'IP地址', dataIndex: 'ip' },
                        { title: '弹性IP地址', dataIndex: 'eip' },
                        { title: '系统', dataIndex: 'system' },
                        { title: '规格', dataIndex: 'subject' },
                        { title: '存储', dataIndex: 'storage' },
                        { title: '额外计费', dataIndex: 'add_fee' },
                        { title: '创建时间', dataIndex: 'start_time' },
                        { title: '每月费用', dataIndex: 'monthly_price' },
                        { title: '计费月数', dataIndex: 'cost_month' },
                        { title: '总计价格', dataIndex: 'all_price' },
                        { title: '备注', dataIndex: 'comment' },
                    ];

                    // 创建工作簿
                    const workbook = new ExcelJS.Workbook();
                    const worksheet = workbook.addWorksheet('Costs');

                    // 添加表头并设置加粗
                    const headerRow = worksheet.addRow(customHeader.map(header => header.title));
                    headerRow.font = { bold: true };

                    // 添加数据行并调整列宽
                    customHeader.forEach((header, index) => {
                        worksheet.getColumn(index + 1).width = header.title.length + 2; // 设置初始宽度
                    });

                    data.forEach(item => {
                        const row = customHeader.map(header => item[header.dataIndex]);
                        worksheet.addRow(row);

                        // 调整列宽
                        row.forEach((cell, index) => {
                            const col = worksheet.getColumn(index + 1);
                            const cellLength = String(cell).length; // 计算单元格内容的长度
                            col.width = Math.max(col.width, cellLength + 5); // 更新列宽
                        });
                    });

                    // 设置所有单元格居中
                    worksheet.eachRow((row) => {
                        row.alignment = { horizontal: 'center' };
                    });

                    // 导出文件
                    workbook.xlsx.writeBuffer().then((buffer) => {
                        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${values.name}.xlsx`;
                        a.click();
                        setConfirmLoading(false);
                        setIsModalOpen(false);
                    });
                })
                .catch(error => {
                    console.error('Error exporting data:', error);
                    setConfirmLoading(false);
                });
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        axios.get('/yd_xc/api/getServiceByTree')
            .then(response => {
                setTreeData(Array.isArray(response.data) ? response.data : []);
            })
            .catch(error => {
                console.error('Error fetching tree data:', error);
                setTreeData([]);
            });

        axios.get('/yd_xc/api/GetYearVersion')
            .then(response => {
                setVersionData(Array.isArray(response.data) ? response.data : []);
            })
            .catch(error => {
                console.error('Error fetching version data:', error);
                setVersionData([]);
            });
    }, []);

    const [form] = Form.useForm();

    const onTreeSelectChange = (value) => {
        setSelectedProject(value);
        console.log("选择导出的系统", selectedProject);
    };

    return (
        <>
            <Button type="default" onClick={showModal} style={{margin: "0.25rem"}}>导出资源</Button>
            <Modal title="导出资源" open={isModalOpen} onOk={handleExport} onCancel={handleCancel}
                   style={{minWidth: "100vh"}} confirmLoading={confirmLoading} okText="导出">
                <Form form={form} layout="horizontal" autoComplete="off"
                      style={{marginLeft: "10vh", marginRight: "10vh", marginTop: "5vh", marginBottom: "5vh"}}>
                    <Form.Item name="name" label="报表名称"
                               rules={[{required: true, message: '请输入报表名称'}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="dateRange" label="计费周期"
                               rules={[{required: true, message: '请选择计费周期'}]}>
                        <RangePicker picker="month"/>
                    </Form.Item>
                    <Form.Item name="version" label="计费版本"
                               rules={[{required: true, message: '请选择计费版本'}]}>
                        <Select options={versionData}/>
                    </Form.Item>
                    <Form.Item name="service" label="系统服务"
                               rules={[{required: true, message: '请选择系统服务'}]}>
                        <TreeSelect
                            showSearch
                            maxTagCount={0}
                            dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                            placeholder="选择项目系统"
                            allowClear
                            treeCheckable={true}
                            onChange={onTreeSelectChange}
                            treeData={treeData}
                            style={{width: 300}}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default ExportButton;
