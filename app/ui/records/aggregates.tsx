"use client"

import React, { useState, useMemo } from "react"
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
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"
import { IRecord, IThread } from "@/app/lib/types"
import Button from "@/app/ui/Button/Button"
import {
  placeholder,
  calculateMonthlyTotalWorkMins,
  getFormattedTimeString,
  calculateWage,
  mapCurrencyToMark,
  generatePaddedRecordsForMonth,
  timeStringToMins,
} from "@/app/lib/helpers"

// Registration is global and idempotent — do it once at module load rather
// than on every render/mount of this component.
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

export default function Aggregates({
  records,
  thread,
  month,
}: {
  records: IRecord[]
  thread: IThread
  month: string
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("work hours")

  // Derives entirely from records/thread/month, so this shouldn't be
  // recomputed when only isDetailsOpen/activeTab (unrelated UI state) change.
  const {
    monthlyTotalWorkMins,
    workHoursData,
    workHoursOptions,
    startAndEndTimesdata,
    startAndEndTimesOptions,
    wagesData,
    wagesOptions,
  } = useMemo(() => {
    const monthlyTotalWorkMins = calculateMonthlyTotalWorkMins(records)
    const rawData = generatePaddedRecordsForMonth(month, records)
    const labels = rawData.map((r) => r.date.substring(5))

    const workHoursData = {
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
          backgroundColor: "#1e293b",
          borderColor: "#1e293b",
          borderWidth: 2,
          pointRadius: 4,
        },
      ],
    }
    const workHoursOptions: any = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: (ctx: any) => {
              const mins = ctx.dataset.data[ctx.dataIndex]
              return `Work hours: ${getFormattedTimeString(mins)}`
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
          suggestedMax: 600,
        },
      },
    }

    const startAndEndTimesdata = {
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
          backgroundColor: "#1e293b",
          borderColor: "#1e293b",
          borderWidth: 2,
        },
      ],
    }
    const startAndEndTimesOptions: any = {
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

    const wagesData = {
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
              return calculateWage(
                timeStringToMins(r.totalworkhours),
                thread
              ).inclTax
            }
            return 0
          }),
          backgroundColor: "#1e293b",
          borderColor: "#1e293b",
          borderWidth: 2,
        },
      ],
    }
    const wagesOptions: any = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: (ctx: any) => {
              const wages = ctx.dataset.data[ctx.dataIndex]
              return `Wages (incl. tax): ${mapCurrencyToMark(thread.currency)} ${wages}`
            },
          },
        },
      },
    }

    return {
      monthlyTotalWorkMins,
      workHoursData,
      workHoursOptions,
      startAndEndTimesdata,
      startAndEndTimesOptions,
      wagesData,
      wagesOptions,
    }
  }, [records, thread, month])

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between p-4 bg-slate-100 mb-2 rounded-md">
        <div className="flex">
          <div className="flex items-center mr-8">
            <p className="mr-2">Total Hours: </p>
            <strong>{getFormattedTimeString(monthlyTotalWorkMins)}</strong>
          </div>
          <div className="flex items-center">
            <p className="mr-2">Total Wages (incl. tax): </p>
            <p>
              <span>{mapCurrencyToMark(thread.currency)} </span>
              <strong>
                {calculateWage(monthlyTotalWorkMins, thread).inclTax.toLocaleString()}
              </strong>
            </p>
          </div>
        </div>
        <Button
          type="button"
          className={`flex items-center text-blue-500 ${isDetailsOpen ? "bg-slate-200" : ""}`}
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
                "text-blue-500 border-blue-500": activeTab === "work hours",
                "text-blue-400 border-transparent": activeTab !== "work hours",
              })}
              onClick={() => setActiveTab("work hours")}
            >
              Work hours
            </Button>
            <Button
              type="button"
              className={clsx("rounded-none border-b-2", {
                "text-blue-500 border-blue-500":
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
                "text-blue-500 border-blue-500": activeTab === "wages",
                "text-blue-400 border-transparent": activeTab !== "wages",
              })}
              onClick={() => setActiveTab("wages")}
            >
              Wages
            </Button>
          </div>
          {activeTab === "work hours" && <Line data={workHoursData} options={workHoursOptions} />}
          {activeTab === "work start and end times" && (
            <Bar data={startAndEndTimesdata} options={startAndEndTimesOptions} />
          )}
          {activeTab === "wages" && <Bar data={wagesData} options={wagesOptions} />}
        </div>
      )}
    </div>
  )
}
