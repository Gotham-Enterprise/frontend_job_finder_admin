"use client";
import React, { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import dynamic from "next/dynamic";
import { adminAnalyticsService } from "@/services/adminAnalytics";
import type { Period } from "@/types/analytics";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface CategoryDistributionProps {
  refreshKey?: number;
}

export default function CategoryDistribution({ refreshKey }: CategoryDistributionProps) {
  const [period, setPeriod] = useState<Period>("3m");
  const [categories, setCategories] = useState<string[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF", "#FF6B6B", "#4ECDC4", "#FFD93D"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "straight",
      width: [2, 2, 2, 2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        format: "dd MMM yyyy",
      },
    },
    xaxis: {
      type: "category",
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true);
        const response = await adminAnalyticsService.getJobsByCategory(period);
        if (response.success && response.data) {
          setCategories(response.data.categories);
          setSeries(response.data.series);
        }
      } catch (error) {
        console.error("Error fetching category distribution:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [period, refreshKey]);

  const periodLabels: Record<Period, string> = {
    "24h": "24 Hours",
    "7d": "7 Days",
    "28d": "28 Days",
    "3m": "3 Months",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Applications by Job Category
          </h3>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          {/* <ChartTab /> */}
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(Object.keys(periodLabels) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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
        <div className="flex items-center justify-center h-[310px]">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px] xl:min-w-full">
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={310}
            />
          </div>
        </div>
      )}
    </div>
  );
}
