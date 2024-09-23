import React, {useEffect, useState} from 'react';
import {Column, Pie, Radar, RadialBar, Rose} from '@ant-design/plots';
import axios from 'axios';

const ChartsComponent = () => {
    const [roseData, setRoseData] = useState([]);
    const [columnData, setColumnData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [radarData, setRadarData] = useState([]);
    const [radialBarData, setRadialBarData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [roseResponse, columnResponse, pieResponse, radarResponse, RadialBarResponse] = await Promise.all([axios.get('/yd_xc/api/stats/city'), axios.get('/yd_xc/api/stats/unit'), axios.get('/yd_xc/api/stats/service'), axios.get('/yd_xc/api/stats/bill_subject'), axios.get('/yd_xc/api/stats/system')]);

                // console.log('Rose Data:', roseResponse.data);
                // console.log('Column Data:', columnResponse.data);
                // console.log('Pie Data:', pieResponse.data);
                // console.log('Radar Data:', radarResponse.data);

                setRoseData(roseResponse.data);
                setColumnData(columnResponse.data);
                setPieData(pieResponse.data);
                setRadarData(radarResponse.data);
                setRadialBarData(RadialBarResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // const roseConfig = {
    //     data: roseData,
    //     xField: 'type',
    //     yField: 'value',
    //     radius: 0.8,
    // };
    const roseConfig = {
        data: roseData,
        width: 370,
        height: 370,
        autoFit: false,
        xField: 'type',
        yField: 'value',
        scale: {y: {type: 'sqrt'}},
        transform: [{type: 'groupX', y: 'sum'}],
        axis: {
            y: {
                title: '资源用量', labelFormatter: '~s', tickCount: 5, direction: 'right',
            },
        },
        tooltip: {items: [{channel: 'y', valueFormatter: '~s'}]},
    };

    const columnConfig = {
        height: 350, width: 450, data: columnData, xField: 'type', yField: 'value',
    };

    const pieConfig = {
        height: 300, width: 1200, data: pieData, angleField: 'value', colorField: 'type', radius: 0.8, label: {
            text: (d) => `${d.type}\n ${d.value}`, position: 'spider',
        }, legend: {
            color: {
                title: false, position: 'left', rowPadding: 5,
            },
        },

    };

    const radarConfig = {
        height: 300, width: 300, data: radarData, xField: 'type', yField: 'value', area: {
            style: {
                fillOpacity: 0.2,
            },
        }, scale: {
            x: {
                padding: 0.5, align: 0,
            }, y: {
                nice: true,
            },
        }, axis: {
            x: {
                title: false, grid: true,
            }, y: {
                gridAreaFill: 'rgba(0, 0, 0, 0.04)', label: false, title: false,
            },
        },

    };
    const radialBarConfig = {
        width: 370,
        height: 370,
        //data : radialBarData,
        data: radialBarData.sort((a, b) => a.value - b.value), // 从少到多排序
        xField: 'type',
        yField: 'value',
        // maxAngle: 90, //最大旋转角度,
        radius: 1,
        innerRadius: 0.2,
        tooltip: {
            items: ['star'],
        },
    };


    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', minWidth: "100vh"}}>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                {roseData.length > 0 && (<div style={{width: '80%'}}>
                    <h4>区县资源量Top10</h4>
                    <Rose {...roseConfig} />
                </div>)}
                {columnData.length > 0 && (<div style={{width: '80%'}}>
                    <h4>单位资源量Top10</h4>
                    <Column {...columnConfig} />
                </div>)}
                {radialBarData.length > 0 && (<div style={{width: '80%'}}>
                    <h4>单位资源量Top10</h4>
                    <RadialBar {...radialBarConfig} />
                </div>)}
            </div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                {pieData.length > 0 && (<div style={{width: '80%'}}>
                    <h4>系统资源量Top10</h4>
                    <Pie {...pieConfig} />
                </div>)}
                {radarData.length > 0 && (<div style={{width: '80%'}}>
                    <h4>规格统计Top10</h4>
                    <Radar {...radarConfig} />
                </div>)}
            </div>
        </div>);

};

export default ChartsComponent;
