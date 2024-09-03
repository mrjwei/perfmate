"use client"

import React, { useState } from "react"
import clsx from "clsx"
import { Line, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { User } from "next-auth"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"
import { IRecord } from "@/app/lib/types"
import Button from "@/app/ui/button/button"
import {
  placeholder,
  calculateMonthlyTotalWorkMins,
  getFormattedTimeString,
  calculateWagesFromMins,
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
  const [activeTab, setActiveTab] = useState("work hours")

  const monthlyTotalWorkMins = calculateMonthlyTotalWorkMins(records)
  const rawData = generatePaddedRecordsForMonth(month, records)

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
  )

  const labels = rawData.map((r) => r.date.substring(5))
  const data = {
    labels,
    datasets: [
      {
        label: "Work Hours",
        data: rawData.map((r) => {
          if (r.totalworkhours === placeholder) {
            return 0
          }
          return timeStringToMins(r.totalworkhours)
        }),
        backgroundColor: "rgba(101, 163, 13, 1)",
        borderColor: "rgba(101, 163, 13, 1)",
        borderWidth: 2,
        pointRadius: 4,
      },
    ],
  }
  const options: any = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (mins: number) => {
            return getFormattedTimeString(mins)
          },
        },
        suggestedMin: 360,
        suggestedMax: 600,
      },
    },
  }

  const data2 = {
    labels,
    datasets: [
      {
        label: "Work Start and End Times",
        data: rawData.map((r) => {
          if (
            r.starttime &&
            r.starttime !== placeholder &&
            r.endtime &&
            r.endtime !== placeholder
          ) {
            return [timeStringToMins(r.starttime), timeStringToMins(r.endtime)]
          }
          return [0, 0]
        }),
        backgroundColor: "rgba(101, 163, 13, 1)",
        borderColor: "rgba(101, 163, 13, 1)",
        borderWidth: 2,
      },
    ],
  }
  const options2: any = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        displayColors: false,
        callbacks: {
          label: (ctx: any) => {
            const [startMins, endMins] = ctx.dataset.data[ctx.dataIndex]
            return [
              `Start: ${getFormattedTimeString(startMins)}`,
              `End: ${getFormattedTimeString(endMins)}`,
            ]
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (mins: number) => {
            return getFormattedTimeString(mins)
          },
        },
        suggestedMin: 360,
        suggestedMax: 1200,
      },
    },
  }

  const data3 = {
    labels,
    datasets: [
      {
        label: "Wages",
        data: rawData.map((r) => {
          if (
            r.starttime &&
            r.starttime !== placeholder &&
            r.endtime &&
            r.endtime !== placeholder
          ) {
            return calculateWagesFromMins(
              timeStringToMins(r.totalworkhours),
              user.hourlywages
            )
          }
          return 0
        }),
        backgroundColor: "rgba(101, 163, 13, 1)",
        borderColor: "rgba(101, 163, 13, 1)",
        borderWidth: 2,
      },
    ],
  }
  const options3: any = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        ticks: {
          // callback: (mins: number) => {
          //   return getFormattedTimeString(mins)
          // },
        },
        // suggestedMin: 0,
        // suggestedMax: 1200,
      },
    },
  }

  return (
    <div className="mb-4">
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
                {calculateWagesFromMins(
                  monthlyTotalWorkMins,
                  user.hourlywages
                ).toLocaleString()}
              </strong>
            </p>
          </div>
        </div>
        <Button
          type="button"
          className="flex items-center text-blue-500"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
        >
          <span className="mr-2">Show details</span>
          {isDetailsOpen ? (
            <ChevronUpIcon className="w-4" />
          ) : (
            <ChevronDownIcon className="w-4" />
          )}
        </Button>
      </div>
      {isDetailsOpen && (
        <div>
          <div className="flex items-end mb-2">
            <Button
              type="button"
              className={clsx("rounded-none border-b-2", {
                "text-blue-600 border-blue-600": activeTab === "work hours",
                "text-blue-400 border-transparent": activeTab !== "work hours",
              })}
              onClick={() => setActiveTab("work hours")}
            >
              Work hours
            </Button>
            <Button
              type="button"
              className={clsx("rounded-none border-b-2", {
                "text-blue-600 border-blue-600":
                  activeTab === "work start and end times",
                "text-blue-400 border-transparent":
                  activeTab !== "work start and end times",
              })}
              onClick={() => setActiveTab("work start and end times")}
            >
              Work start and end times
            </Button>
            <Button
              type="button"
              className={clsx("rounded-none border-b-2", {
                "text-blue-600 border-blue-600": activeTab === "wages",
                "text-blue-400 border-transparent": activeTab !== "wages",
              })}
              onClick={() => setActiveTab("wages")}
            >
              Wages
            </Button>
          </div>
          {activeTab === "work hours" && <Line data={data} options={options} />}
          {activeTab === "work start and end times" && (
            <Bar data={data2} options={options2} />
          )}
          {activeTab === "wages" && <Bar data={data3} options={options3} />}
        </div>
      )}
    </div>
  )
}
