import { TableCell, TableRow } from "../table";

function TableSkeleton({ columns, hasExpander, rows = 5  }: { columns: any[]; hasExpander: boolean ; rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <TableRow key={idx}>
          {hasExpander && (
            <TableCell className="py-3">
              <div className="h-8 w-4 rounded bg-muted animate-pulse" />
            </TableCell>
          )}

          {columns.map((_, colIdx) => (
            <TableCell key={colIdx} className="py-3">
              <div className="h-8 w-full rounded bg-muted animate-pulse" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
export default TableSkeleton;