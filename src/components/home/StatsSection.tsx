/*
 * File: src/components/home/StatsSection.js
 * SR-DEV: Premium Stats Display
 * FIX: Reduced vertical padding on mobile (py-12) for better density.
 */

"use client";

export default function StatsSection() {
  const stats = [
    { label: "Therapy Sessions", value: "25k+", color: "from-blue-600 to-cyan-500" },
    { label: "Verified Experts", value: "500+", color: "from-purple-600 to-pink-500" },
    { label: "Lives Changed", value: "10k+", color: "from-orange-600 to-amber-500" },
    { label: "Average Rating", value: "4.9", color: "from-green-600 to-emerald-500" },
  ];

  return (
    // FIX: Changed 'py-20' to 'py-12 md:py-20'
    <section className="py-8 md:py-20 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      
      {/* Background Doodle: Dot Grid */}
      <div className="absolute inset-0 opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="container px-4 mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="group bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center"
            >
              <h3 className={`text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r ${stat.color} mb-2`}>
                {stat.value}
              </h3>
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}