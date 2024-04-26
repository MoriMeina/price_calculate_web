import React, { useState } from 'react';
import {
    DesktopOutlined,
    PieChartOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {  Layout, Menu, theme } from 'antd';
import MainCost from '../../components/mainCost';


// const { Header, Content, Footer, Sider } = Layout;
 const { Header, Content,Sider } = Layout;

function getItem(label, key, icon) {
    return {
        key,
        icon,
        label,
    };
}

const items = [
    getItem('计费主页', '1', <PieChartOutlined />),
    getItem('价格管理', '2', <DesktopOutlined />),
    getItem('项目管理', '3', <UserOutlined />)
];

const componentMap = {
    '1': MainCost, // 映射菜单项 '1' 到 HomePage 组件
    // '2': PriceManagement, // 映射菜单项 '2' 到 PriceManagement 组件
    // '3': ProjectManagement, // 映射菜单项 '3' 到 ProjectManagement 组件
};

const MenuLay = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedMenuItem, setSelectedMenuItem] = useState('1'); // 初始选中菜单项为 '1'

    const handleMenuClick = (e) => {
        setSelectedMenuItem(e.key);
    };

    const SelectedComponent = componentMap[selectedMenuItem];

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout
            style={{
                minHeight: '100vh',
            }}
        >
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="demo-logo-vertical" />
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} onClick={handleMenuClick} />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                    }}
                />
                <Content
                    style={{
                        margin: '0',
                    }}
                >
                    <div
                        style={{
                            padding: 10,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <SelectedComponent />
                    </div>
                </Content>
                {/*<Footer*/}
                {/*    style={{*/}
                {/*        textAlign: 'center',*/}
                {/*    }}*/}
                {/*>*/}
                {/*    Ant Design ©{new Date().getFullYear()} Created by Ant UED*/}
                {/*</Footer>*/}
            </Layout>
        </Layout>
    );
};

export default MenuLay;
