import { Skeleton } from "@/shared/components/ui/skeleton"

export const DetailsSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-muted p-4 rounded-md space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="bg-muted p-4 rounded-md space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  </div>
)

export const StepperSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-3 w-full" />
    </div>
  </div>
)

export const ItemsTableSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
)

export const HeaderSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-1/3" />
  </div>
)
