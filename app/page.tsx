{/* ============ HEADER ============ */}
<div className="flex items-start justify-between flex-wrap gap-4">
  <div>
    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
      {getGreeting()} <span className="inline-block">👋</span>
    </h1>
    <p className="text-muted-foreground mt-1.5">
      Here's what's happening with your leads today.
    </p>
  </div>
  <div className="flex items-center gap-3">
    <StatusIndicator />
    <Link
      href="/finder"
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg"
    >
      <Search className="h-4 w-4" />
      Find Leads
    </Link>
  </div>
</div>
