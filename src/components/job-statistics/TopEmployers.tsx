"use client";
import Image from "next/image";
import Star from "@/components/ui/star";


export default function TopEmployers() {
  const topThreeEmployers = [
    {
      id: 1,
      rank: 1,
      name: "Wayne Tech",
      image: "/images/cards/top-1-employer.svg",
      rating: 5.0,
      imageSize: 68
    },
    {
      id: 2,
      rank: 2,
      name: "Queen Industries",
      image: "/images/cards/top-2-employer.svg",
      rating: 4.9,
      imageSize: 54
    },
    {
      id: 3,
      rank: 3,
      name: "Palmer Tech",
      image: "/images/cards/top-3-employer.svg",
      rating: 4.8,
      imageSize: 54
    }
  ];
  
  const employersData = [
    {
      id: 1,
      rank: 4,
      name: "Healthcare",
      icon: "/images/icons/o-plus-icon.svg",
      rating: 4.9
    },
    {
      id: 2,
      rank: 5,
      name: "Technology",
      icon: "/images/icons/o-plus-icon.svg",
      rating: 4.8
    },
    {
      id: 3,
      rank: 6,
      name: "Education",
      icon: "/images/icons/o-plus-icon.svg",
      rating: 4.7
    },
    {
      id: 4,
      rank: 7,
      name: "Finance",
      icon: "/images/icons/o-plus-icon.svg",
      rating: 4.6
    },
    {
      id: 5,
      rank: 8,
      name: "Manufacturing",
      icon: "/images/icons/o-plus-icon.svg",
      rating: 4.5
    },
    {
      id: 6,
      rank: 9,
      name: "Retail",
      icon: "/images/icons/o-plus-icon.svg",
      rating: 4.4
    },
    {
      id: 7,
      rank: 10,
      name: "Hospitality",
      icon: "/images/icons/o-plus-icon.svg",
      rating: 4.3
    }
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-8 dark:bg-gray-900 sm:px-6 sm:pt-6 relative min-h-[420px]">
        {/* Blurred content wrapper */}
        <div className="blur-sm pointer-events-none select-none">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Top Employers
              </h3>
            </div>
          </div>
          <div className="mt-6 mb-8">
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center space-y-2">
                <span className="font-bold text-lg text-gray-700 dark:text-white/80">
                  {topThreeEmployers[0].rank}
                </span>
                <div className="relative h-[68px] w-[68px]">
                  <Image
                    src={topThreeEmployers[0].image}
                    alt={`Top Employer ${topThreeEmployers[0].rank}`}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <span className="font-medium text-sm text-gray-800 dark:text-white/90 h-5">
                  {topThreeEmployers[0].name}
                </span>
                <div className="flex items-center space-x-1">
                  <Star />
                  <span className="text-rates dark:text-white/90">
                    {topThreeEmployers[0].rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Bottom Row with Employers 2 and 3 */}
              <div className="flex justify-center w-full">
                <div className="flex justify-between max-w-sm w-full px-4">
                  {/* Left Employer (Rank 2) */}
                  <div className="flex flex-col items-center space-y-2">
                    <span className="font-bold text-lg text-gray-700 dark:text-white/80">
                      {topThreeEmployers[1].rank}
                    </span>
                    <div className="relative h-[54px] w-[54px]">
                      <Image
                        src={topThreeEmployers[1].image}
                        alt={`Top Employer ${topThreeEmployers[1].rank}`}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <span className="font-medium text-sm text-gray-800 dark:text-white/90 h-5">
                      {topThreeEmployers[1].name}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star />
                      <span className="text-rates dark:text-white/90">
                        {topThreeEmployers[1].rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Right Employer (Rank 3) */}
                  <div className="flex flex-col items-center space-y-2">
                    <span className="font-bold text-lg text-gray-700 dark:text-white/80">
                      {topThreeEmployers[2].rank}
                    </span>
                    <div className="relative h-[54px] w-[54px]">
                      <Image
                        src={topThreeEmployers[2].image}
                        alt={`Top Employer ${topThreeEmployers[2].rank}`}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <span className="font-medium text-sm text-gray-800 dark:text-white/90 h-5">
                      {topThreeEmployers[2].name}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star />
                      <span className="text-rates dark:text-white/90">
                        {topThreeEmployers[2].rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {employersData.map((employer) => (
              <div
                key={employer.id}
                className="dark:bg-primary  bg-secondary rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-lg text-gray-700 dark:text-white/80">
                    {employer.rank}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 relative flex items-center justify-center bg-primary/10 rounded-full">
                      <Image
                        src={employer.icon}
                        alt={employer.name}
                        width={16}
                        height={16}
                      />
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {employer.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star />
                  <span className="text-rates dark:text-white/90">
                    {employer.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overlay message */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl">
          <div className="text-center px-4">
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              Data Not Available
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Top employers analytics coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
