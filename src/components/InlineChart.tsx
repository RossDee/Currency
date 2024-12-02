'use client';

import ReactECharts from 'echarts-for-react';

interface InlineChartProps {
  data: {
    buyingRate: number;
    sellingRate: number;
    middleRate: number;
    timestamp: string;
  }[];
}

export default function InlineChart({ data }: InlineChartProps) {
  const option = {
    grid: {
      top: 5,
      right: 5,
      bottom: 5,
      left: 5,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      show: false,
      data: data.map((d) => d.timestamp),
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    series: [
      {
        data: data.map((d) => d.middleRate),
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#3b82f6',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(59,130,246,0.2)',
              },
              {
                offset: 1,
                color: 'rgba(59,130,246,0)',
              },
            ],
          },
        },
      },
    ],
    animation: false,
  };

  return (
    <ReactECharts option={option} style={{ height: '40px', width: '120px' }} notMerge={true} />
  );
}
