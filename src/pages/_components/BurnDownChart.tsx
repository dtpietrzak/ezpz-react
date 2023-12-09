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

    let acc: number = 0
    const remainingForEachDaySoFar = data.map((amount, i) => {
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

    console.log('slope', burnDownVelocitySlope)

    const burnDownVelocity = Array.from(
      { length: numOfTicks },
      (_, i) => (i - 1),
    ).map((i) => (burnDownGoalArray[0] - (burnDownVelocitySlope * (i + 1))))

    console.table({
      labels,
      burnDownGoalArray,
      burnDownVelocity,
      remainingForEachDaySoFar,
      transactions: data,
    })

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
    <Paper shadow="xs" bg='rgb(220,220,220)' mah={200}>
      <Line
        options={options}
        data={chartData}
      />
    </Paper>
  )
}