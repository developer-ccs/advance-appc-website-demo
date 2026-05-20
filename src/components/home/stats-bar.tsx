"use client";

import { Building2, User, Users, GraduationCap } from "lucide-react";

const stats = [
  {
    label: "Institution Corner",
    count: "6,509",
    icon: Building2,
    color: "text-yellow-400",
    bgIcon: "text-yellow-400/20",
  },
  {
    label: "Registered Pharmacist",
    count: "1,37,068",
    icon: User,
    color: "text-blue-400",
    bgIcon: "text-blue-400/20",
  },
  {
    label: "Faculty Corner",
    count: "1,11,509",
    icon: Users,
    color: "text-pink-400",
    bgIcon: "text-pink-400/20",
  },
  {
    label: "Student Corner",
    count: "6,38,566",
    icon: GraduationCap,
    color: "text-green-400",
    bgIcon: "text-green-400/20",
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
              className="relative p-6 group hover:bg-white/5 transition-colors duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-white/70 text-sm font-medium uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <h3
                    className={`text-3xl 2xl:text-4xl font-bold ${stat.color} tracking-tight`}
                  >
                    {stat.count}
                  </h3>
                </div>

                <div
                  className={`${stat.color} p-2 rounded-lg bg-white/5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon size={28} strokeWidth={2} />
                </div>
              </div>

              {/* Subtle decorative element */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-current transition-all duration-500 group-hover:w-full opacity-50" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
