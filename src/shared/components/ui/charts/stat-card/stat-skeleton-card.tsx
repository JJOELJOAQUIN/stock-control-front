export function SkeletonStatCard() {
  return (
    <article className="flex min-w-[200px] items-center gap-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-primary/20 dark:bg-white/5 animate-pulse">

      {/* ICON BOX */}
      <div className="h-12 w-12 shrink-0 rounded-xl bg-gray-200 dark:bg-gray-700" />

      <div className="flex flex-1 flex-col gap-2">

        {/* VALUE */}
        <div className="h-6 w-3/5 rounded-md bg-gray-200 dark:bg-gray-700" />

        {/* TITLE + BADGE */}
        <div className="flex items-center gap-3 w-full">
          <div className="h-4 flex-1 rounded-md bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-[15%] rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

      </div>

    </article>
  );
}
