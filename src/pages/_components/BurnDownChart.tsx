import * as React from 'react'
import { FC, LoadHandler, useEffect, useState } from 'ezpz'
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
import { LoadStatus } from 'ezpz/types'

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
  loadStatus: LoadStatus
}

export const BurnDownChart: FC<BurnDownChartProps> = ({
  data,
  numOfTicks,
  totalAmount,
  loadStatus,
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
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: totalAmount,
          display: false,
        },
        x: {
          display: false,
        }
      },
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

    let acc: number = 0
    const remainingForEachDaySoFar = data.map((amount) => {
      acc += amount
      const remaining = totalAmount - acc
      return remaining
    })

    const perTickAverage = (1 / numOfTicks) * totalAmount
    const burnDownGoalArray = Array.from(
      { length: numOfTicks },
      (_, i) => (i + 1),
    ).map((i) => (totalAmount - (perTickAverage * i)))

    const burnDownVelocitySlope = data.reduce((acc, cur) => {
      return acc + cur
    }) / data.length

    const burnDownVelocity = Array.from(
      { length: numOfTicks },
      (_, i) => (i - 1),
    ).map((i) => (burnDownGoalArray[0] - (burnDownVelocitySlope * (i + 1))))

    setChartData({
      labels,
      datasets: [
        {
          label: 'Velocity',
          data: burnDownVelocity,
          borderColor: 'grey',
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: 'Goal',
          data: burnDownGoalArray,
          borderColor: 'grey',
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 2,
          borderDash: [5, 5],
        },
        {
          label: 'Actual',
          data: remainingForEachDaySoFar,
          borderColor: 'green',
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 4,
        },
      ],
    })
  }, [data, numOfTicks, totalAmount])

  return (
    <LoadHandler
      status={loadStatus}
      firstLoad={
        <Paper shadow="xs" bg='rgb(244,244,245)' mah={100}>
          <Line
            options={options}
            data={{labels: [], datasets: []}}
          />
        </Paper>
      }
      success={
        <Paper shadow="xs" bg='rgb(244,244,245)' mah={100}>
          <Line
            options={options}
            data={chartData}
          />
        </Paper>
      }
    />
  )
}