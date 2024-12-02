'use client';

import ReactECharts from 'echarts-for-react';

interface DetailedChartProps {
  data: {
    buyingRate: number;
    sellingRate: number;
    middleRate: number;
    timestamp: string;
  }[];
  currency: string;
}

export default function DetailedChart({ data, currency }: DetailedChartProps) {
  const option = {
    title: {
      text: `${currency} Exchange Rate History`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['Buying Rate', 'Selling Rate', 'Middle Rate'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '60px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(d => d.timestamp)
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: 'Buying Rate',
        type: 'line',
        data: data.map(d => d.buyingRate),
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#10B981'
        }
      },
      {
        name: 'Selling Rate',
        type: 'line',
        data: data.map(d => d.sellingRate),
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#EF4444'
        }
      },
      {
        name: 'Middle Rate',
        type: 'line',
        data: data.map(d => d.middleRate),
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#3B82F6'
        }
      }
    ]
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <ReactECharts 
        option={option}
        style={{ height: '400px' }}
        notMerge={true}
      />
    </div>
  );
}
