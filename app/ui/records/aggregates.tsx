"use client"

import React, { useState, useMemo } from "react"
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
  ChartOptions,
  TooltipItem,
} from "chart.js"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"
import { IRecord, IThread } from "@/app/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
    const workHoursOptions: ChartOptions<'line'> = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: (ctx: TooltipItem<'line'>) => {
              const mins = ctx.dataset.data[ctx.dataIndex] as number
              return `Work hours: ${getFormattedTimeString(mins)}`
            },
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (mins: string | number) => {
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
    const startAndEndTimesOptions: ChartOptions<'bar'> = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: (ctx: TooltipItem<'bar'>) => {
              const [startMins, endMins] = ctx.dataset.data[ctx.dataIndex] as unknown as [number, number]
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
            callback: (mins: string | number) => {
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
    const wagesOptions: ChartOptions<'bar'> = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: (ctx: TooltipItem<'bar'>) => {
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
      <Card className="flex-row items-center justify-between p-4 mb-2">
        <div className="flex">
          <div className="flex items-center mr-8">
            <p className="mr-2 text-muted-foreground">Total Hours: </p>
            <strong>{getFormattedTimeString(monthlyTotalWorkMins)}</strong>
          </div>
          <div className="flex items-center">
            <p className="mr-2 text-muted-foreground">Total Wages (incl. tax): </p>
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
          variant="ghost"
          size="sm"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
        >
          Show details
          {isDetailsOpen ? (
            <ChevronUpIcon className="w-4" />
          ) : (
            <ChevronDownIcon className="w-4" />
          )}
        </Button>
      </Card>
      {isDetailsOpen && (
        <Card>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList variant="line" className="mb-4">
                <TabsTrigger value="work hours">Work hours</TabsTrigger>
                <TabsTrigger value="work start and end times">Work start and end times</TabsTrigger>
                <TabsTrigger value="wages">Wages</TabsTrigger>
              </TabsList>
              <TabsContent value="work hours">
                <Line data={workHoursData} options={workHoursOptions} />
              </TabsContent>
              <TabsContent value="work start and end times">
                <Bar data={startAndEndTimesdata} options={startAndEndTimesOptions} />
              </TabsContent>
              <TabsContent value="wages">
                <Bar data={wagesData} options={wagesOptions} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
