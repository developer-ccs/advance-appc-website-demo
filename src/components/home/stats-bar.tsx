"use client";

import { Building2, User, Users, GraduationCap } from "lucide-react";

const stats = [
  {
    label: "Institution",
    count: "500",
    icon: Building2,
    color: "text-yellow-400",
  },
  {
    label: "Reg. Pharmacist",
    count: "20,000",
    icon: User,
    color: "text-blue-400",
  },
  {
    label: "Faculty",
    count: "30,000",
    icon: Users,
    color: "text-pink-400",
  },
  {
    label: "Student",
    count: "25,000",
    icon: GraduationCap,
    color: "text-green-400",
  },
];

export function StatsBar() {
  return (
    <section className="py-12">
      <div className="mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-[#062045] rounded-2xl shadow-2xl overflow-hidden border border-white/10 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative p-6 group hover:bg-white/5 transition-colors duration-300 flex flex-col items-center gap-3"
            >
              {/* Icon + Label row */}
              <div className="flex items-center gap-2">
                <stat.icon
                  size={20}
                  strokeWidth={2}
                  className={`${stat.color} group-hover:scale-110 transition-transform duration-300`}
                />
                <p className="text-white/70 text-sm font-semibold uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>

              {/* Count centered below */}
              <h3
                className={`text-2xl 2xl:text-3xl font-semibold ${stat.color} tracking-tight`}
              >
                {stat.count}
              </h3>

              {/* Subtle bottom accent */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-current transition-all duration-500 group-hover:w-full opacity-50" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
