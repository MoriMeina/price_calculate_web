import React, {useState, useEffect} from 'react';
import {Layout, Menu, Select, TreeSelect} from 'antd';
import axios from 'axios';
import CostTable from "../../components/costTable";

const {Header, Content, Sider} = Layout;

const NavSide = () => {
    const [treeData, setTreeData] = useState([]);
    const [versionData, setVersionData] = useState([]);
    const [versionSelected, setVersionSelected] = useState('2024');
    const [selectedProject, setSelectedProject] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/getServiceByTree')
            .then(response => {
                setTreeData(Array.isArray(response.data) ? response.data : []);
            })
            .catch(error => {
                console.error('Error fetching tree data:', error);
                setTreeData([]);
            });

        axios.get('http://127.0.0.1:5000/GetYearVersion')
            .then(response => {
                setVersionData(Array.isArray(response.data) ? response.data : []);
            })
            .catch(error => {
                console.error('Error fetching version data:', error);
                setVersionData([]);
            });
    }, []);

    const onTreeSelectChange = (value) => {
        console.log('选中系统:', value);
        setSelectedProject(value);
    };

    const onVersionChange = (value) => {
        setVersionSelected(value);
        console.log('选择计费版本:', versionSelected);
    };

    return (
        <>
            <TreeSelect
                showSearch
                value={selectedProject}
                maxTagCount={0}
                dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                placeholder="Please select"
                allowClear
                treeCheckable={true}
                treeDefaultExpandAll
                onChange={onTreeSelectChange}
                treeData={treeData}
                style={{width: 300}}
            />
            <Select
                defaultValue="2024"
                style={{width: 120}}
                onChange={onVersionChange}
                options={versionData}
            />
        </>
    );
};

const BillingSummary = () => <CostTable/>;
const DistrictEdit = () => <div>区县编辑内容</div>;
const BillingPrice = () => <div>计费价格内容</div>;
const OwnershipApp = () => <div>归属应用内容</div>;
const ExtraCost = () => <div>额外费用内容</div>;

const LeftSide = ({onMenuSelect}) => {
    const menuItems = [
        {label: '计费总表', key: 'billingSummary'},
        {label: '区县编辑', key: 'districtEdit'},
        {label: '计费价格', key: 'billingPrice'},
        {label: '归属应用', key: 'ownershipApp'},
        {label: '额外费用', key: 'extraCost'},
    ];

    return (
        <Menu
            mode="inline"
            defaultSelectedKeys={['billingSummary']}
            style={{height: '100%', borderRight: 0}}
            theme="light"
            items={menuItems}
            onClick={(e) => onMenuSelect(e.key)}
        />
    );
};

const MenuComponent = () => {
    const [selectedMenuKey, setSelectedMenuKey] = useState('billingSummary');

    const renderContent = () => {
        switch (selectedMenuKey) {
            case 'billingSummary':
                return <BillingSummary/>;
            case 'districtEdit':
                return <DistrictEdit/>;
            case 'billingPrice':
                return <BillingPrice/>;
            case 'ownershipApp':
                return <OwnershipApp/>;
            case 'extraCost':
                return <ExtraCost/>;
            default:
                return null;
        }
    };

    return (
        <Layout>
            <Header
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',backgroundColor: '#fff', padding: '0 24px', height: '8vh', borderBottom: '1px solid #f0f0f0',
                }}
            >
                <NavSide/>
            </Header>
            <Layout>
                <Sider
                    width={200}
                    style={{
                        height: '93vh',
                        background: '#fff',
                    }}
                >
                    <LeftSide onMenuSelect={setSelectedMenuKey}/>
                </Sider>
                <Layout
                    style={{
                        padding: '0 24px 24px',
                    }}
                >
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                            background: '#fff',
                        }}
                    >
                        {renderContent()}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default MenuComponent;
