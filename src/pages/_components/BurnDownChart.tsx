import * as React from 'react'
import { FC, useEffect, useState } from 'ezpz'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Paper } from '@mantine/core'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type BurnDownChartProps = {
  data: number[]
  numOfTicks: number
  totalAmount: number
}

export const BurnDownChart: FC<BurnDownChartProps> = ({
  data,
  numOfTicks,
  totalAmount,
}) => {
  const [options, setOptions] = useState<
    React.ComponentProps<(typeof Line)>['options']
  >({})
  const [chartData, setChartData] = useState<
    React.ComponentProps<(typeof Line)>['data']
  >({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    setOptions({
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: totalAmount,
          display: false,
        },
        x: { display: false }
      },
      aspectRatio: 3.5,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
    })

    const labels = Array.from(
      { length: numOfTicks },
      (_, i) => (i + 1),
    ).map((i) => i.toString())

    const perTickAverage = (1 / numOfTicks) * totalAmount
    const burnDownGoalArray = Array.from(
      { length: numOfTicks },
      (_, i) => (i + 1),
    ).map((i) => (totalAmount - (perTickAverage * i)))

    // this should be the line of best fit for the tempData but extend until it hits or passes 0 or the end of the chart
    const burnDownVelocitySlope = (data[0] - data[data.length - 1]) / data.length
    const burnDownVelocity = Array.from(
      { length: numOfTicks },
      (_, i) => (i - 1),
    ).map((i) => (data[0] - (burnDownVelocitySlope * (i + 1))))


    setChartData({
      labels,
      datasets: [
        {
          label: 'Actual',
          data: data,
          borderColor: 'rgb(200, 65, 50)',
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: 'Velocity',
          data: burnDownVelocity,
          borderColor: 'rgb(100, 200, 50)',
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: 'Goal',
          data: burnDownGoalArray,
          borderColor: 'rgb(190, 190, 190)',
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 2,

        },
      ],
    })
  }, [data, numOfTicks, totalAmount])

  return (
    <Paper shadow="xs" bg='rgb(220,220,220)'>
      <Line
        options={options}
        data={chartData}
      />
    </Paper>
  )
}