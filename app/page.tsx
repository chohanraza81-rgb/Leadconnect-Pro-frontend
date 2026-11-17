{/* QUICK ACTIONS — NEW */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <Link
    href="/finder"
    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 text-white hover:shadow-xl transition-all"
  >
    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
    <Search className="h-8 w-8 mb-3" />
    <h3 className="text-lg font-bold">Find New Leads</h3>
    <p className="text-sm text-white/80 mt-1">Discover verified prospects by niche & country.</p>
  </Link>
  <Link
    href="/local-insights"
    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white hover:shadow-xl transition-all"
  >
    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
    <Sparkles className="h-8 w-8 mb-3" />
    <h3 className="text-lg font-bold">Local Insights</h3>
    <p className="text-sm text-white/80 mt-1">Find local businesses on Google Maps.</p>
  </Link>
</div>
