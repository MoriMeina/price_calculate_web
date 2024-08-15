import React, {useState, useEffect} from 'react';
import {Layout, Menu, Select, TreeSelect} from 'antd';
import axios from 'axios';
import CostTable from "../../components/costTable";

const {Header, Content, Sider} = Layout;

const NavSide = ({ setVersionSelected, setSelectedProject }) => {
    const [treeData, setTreeData] = useState([]);
    const [versionData, setVersionData] = useState([]);
    const [defaultProject,setDefaultProject] = useState([]);

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
        axios.get('http://127.0.0.1:5000/getAllService')
            .then(response => {
                setDefaultProject(Array.isArray(response.data) ? response.data : []);
                setSelectedProject(Array.isArray(response.data) ? response.data : []);
            })
            .catch(error => {
                console.error('Error fetching version data:', error);
                setDefaultProject([]);
            });
    }, []);

    const onTreeSelectChange = (value) => {
        // console.log('选中系统:', value);
        setSelectedProject(value);
    };

    const onVersionChange = (value) => {
        setVersionSelected(value);
        // console.log('选择计费版本:', value);
    };

    return (
        <>
            <TreeSelect
                showSearch
                maxTagCount={0}
                value={defaultProject}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder="选择项目系统"
                allowClear
                treeCheckable={true}
                // treeDefaultExpandAll
                onChange={onTreeSelectChange}
                treeData={treeData}
                style={{ width: 300 }}
            />
            <Select
                defaultValue="2024"
                style={{ width: 120 }}
                onChange={onVersionChange}
                options={versionData}
            />
        </>
    );
};

const BillingSummary = ({ versionSelected, selectedProject }) => {
    console.log("向子组件传参(计费版本选择):",versionSelected)
    console.log("向子组件传参(项目选择):",selectedProject)
    return <CostTable Version={versionSelected} Project={selectedProject}/>;
};

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
    const [versionSelected, setVersionSelected] = useState('2024');
    const [selectedProject, setSelectedProject] = useState([]);

    const renderContent = () => {
        switch (selectedMenuKey) {
            case 'billingSummary':
                return <BillingSummary versionSelected={versionSelected} selectedProject={selectedProject} />;
            case 'districtEdit':
                return <DistrictEdit />;
            case 'billingPrice':
                return <BillingPrice />;
            case 'ownershipApp':
                return <OwnershipApp />;
            case 'extraCost':
                return <ExtraCost />;
            default:
                return null;
        }
    };

    return (
        <Layout>
            <Header
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
            >
                <NavSide
                    setVersionSelected={setVersionSelected}
                    setSelectedProject={setSelectedProject}
                />
            </Header>
            <Layout>
                <Sider
                    width={200}
                    style={{
                        minHeight: "700px",
                        height: '92.5vh',
                        background: '#fff',
                        borderRight: '1px solid #f0f0f0',
                    }}
                >
                    <LeftSide onMenuSelect={setSelectedMenuKey}/>
                </Sider>
                <Layout>
                    <Content
                        style={{
                            minWidth: "1000px",
                            padding: 5,
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
