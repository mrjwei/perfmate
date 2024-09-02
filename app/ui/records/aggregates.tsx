"use client"

import React, { useState } from "react"
import { Line } from "react-chartjs-2"
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
import { User } from "next-auth"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"
import { IRecord } from "@/app/lib/types"
import Button from "@/app/ui/button/button"
import {
  calculateMonthlyTotalWorkMins,
  getFormattedTimeString,
  calculateMonthlyTotalWages,
  mapCurrencyToMark,
  generatePaddedRecordsForMonth,
  timeStringToMins,
} from "@/app/lib/helpers"

export default function Aggregates({
  records,
  user,
  month,
}: {
  records: IRecord[]
  user: User
  month: string
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const monthlyTotalWorkMins = calculateMonthlyTotalWorkMins(records)
  const rawData = generatePaddedRecordsForMonth(month, records)

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  )

  const labels = rawData.map((r) => r.date)
  const data = {
    labels,
    datasets: [
      {
        label: "Work Hours",
        data: rawData.map((r) => timeStringToMins(r.totalworkhours)),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  }
  const options: any = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Work Hours and Wages",
      },
    },
  }

  return (
    <div className=" mb-4">
      <div className="flex items-center justify-between p-4 bg-lime-100 mb-2">
        <div className="flex">
          <div className="flex items-center mr-8">
            <p className="mr-2">Total Hours: </p>
            <strong>{getFormattedTimeString(monthlyTotalWorkMins)}</strong>
          </div>
          <div className="flex items-center">
            <p className="mr-2">Total Wages: </p>
            <p>
              <span>{mapCurrencyToMark(user.currency)} </span>
              <strong>
                {calculateMonthlyTotalWages(
                  monthlyTotalWorkMins,
                  user.hourlywages
                )}
              </strong>
            </p>
          </div>
        </div>
        <Button type="button" className="flex items-center text-blue-500" onClick={() => setIsDetailsOpen(!isDetailsOpen)}>
          <span className="mr-2">Show details</span>
          {isDetailsOpen ? (
            <ChevronUpIcon className="w-4" />
          ) : (
            <ChevronDownIcon className="w-4" />
          )}
        </Button>
      </div>
      {isDetailsOpen && <Line data={data} options={options} />}
    </div>
  )
}
