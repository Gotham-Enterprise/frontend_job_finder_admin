"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { adminAnalyticsService } from "@/services/adminAnalytics";
import type { Period } from "@/types/analytics";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface JobseekerTrendsProps {
  refreshKey?: number;
}

export default function JobseekerTrends({ refreshKey }: JobseekerTrendsProps) {
  const [period, setPeriod] = useState<Period>("3m");
  const [categories, setCategories] = useState<string[]>([]);
  const [data, setData] = useState<number[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const options: ApexOptions = {
    colors: ["#10B981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  const series = [
    {
      name: "New Jobseekers",
      data: data,
    },
  ];

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setIsLoading(true);
        const response = await adminAnalyticsService.getJobseekerTrends(period);
        if (response.success && response.data) {
          setCategories(response.data.categories);
          setData(response.data.data);
          setTotal(response.data.total || 0);
        }
      } catch (error) {
        console.error("Error fetching jobseeker trends:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, [period, refreshKey]);

  const periodLabels: Record<Period, string> = {
    "24h": "Last 24 Hours",
    "7d": "Last 7 Days",
    "28d": "Last 28 Days",
    "3m": "Last 3 Months",
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          New Jobseeker Registrations
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Total New Jobseekers: <span className="font-semibold text-gray-800 dark:text-white/90">{total.toLocaleString()}</span>
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(Object.keys(periodLabels) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[719px]">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={719}
            />
          </div>
        </div>
      )}
    </div>
  );
}
