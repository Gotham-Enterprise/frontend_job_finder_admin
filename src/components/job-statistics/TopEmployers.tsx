"use client";
import Image from "next/image";
import Star from "@/components/ui/star";


export default function TopEmployers() {
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
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-8 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Top Employers
            </h3>
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
    </div>
  );
}
