import React, { useEffect, useState } from 'react';
import { Breadcrumb, Layout, Menu, theme, TreeSelect } from 'antd';
import axios from 'axios';

const { Header, Content, Sider } = Layout;

const SearchableTreeSelect = () => {
    const [treeData, setTreeData] = useState([]);
    const [value, setValue] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/getServiceByTree')
            .then(response => {
                setTreeData(Array.isArray(response.data) ? response.data : []);
            })
            .catch(error => {
                console.error('Error fetching tree data:', error);
                setTreeData([]); // 请求失败时设置为空数组
            });
    }, []);

    const onChange = (value) => {
        console.log('Selected Values:', value);
        setValue(value);
    };

    return (
        <TreeSelect
            showSearch
            value={value}
            maxTagCount={0}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            placeholder="Please select"
            allowClear
            treeCheckable={true}  // 允许多选
            treeDefaultExpandAll
            onChange={onChange}
            treeData={treeData}
            style={{ width: 300 }}
        />
    );
};

const MenuComponent = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout>
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <SearchableTreeSelect />
            </Header>
            <Layout>
                <Sider
                    width={200}
                    style={{
                        background: colorBgContainer,
                    }}
                >
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['1']}
                        defaultOpenKeys={['sub1']}
                        style={{
                            height: '100%',
                            borderRight: 0,
                        }}
                        items={[]}
                    />
                </Sider>
                <Layout
                    style={{
                        padding: '0 24px 24px',
                    }}
                >
                    <Breadcrumb
                        style={{
                            margin: '16px 0',
                        }}
                    >
                        <Breadcrumb.Item>Home</Breadcrumb.Item>
                        <Breadcrumb.Item>List</Breadcrumb.Item>
                        <Breadcrumb.Item>App</Breadcrumb.Item>
                    </Breadcrumb>
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        Content
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default MenuComponent;
