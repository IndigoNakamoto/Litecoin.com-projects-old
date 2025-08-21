import { Donation } from '@prisma/client'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'

interface DonationWithMatchedAmount extends Donation {
  matchedAmount: number
  serviceFee: number
  netAmount: number
}

const columnHelper = createColumnHelper<DonationWithMatchedAmount>()

export default function DonationsTable({
  donations,
}: {
  donations: DonationWithMatchedAmount[]
}) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.accessor('projectSlug', {
        header: 'Project',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('valueAtDonationTimeUSD', {
        header: 'Value (USD)',
        cell: (info) => `$${info.getValue() ?? 0}`,
      }),
      columnHelper.accessor('matchedAmount', {
        header: 'Matched Amount',
        cell: (info) => `$${info.getValue()}`,
      }),
      columnHelper.accessor('serviceFee', {
        header: "LF's Service Fee",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor('netAmount', {
        header: 'Net Amount',
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
        id: 'donor',
        header: 'Donor',
        cell: (info) =>
          info.row.original.isAnonymous ? 'Anonymous' : info.getValue(),
      }),
      columnHelper.accessor('donorEmail', {
        header: 'Email',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => info.getValue(),
      }),
    ],
    []
  )

  const table = useReactTable({
    data: donations,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <table className="min-w-full table-auto">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                colSpan={header.colSpan}
                className="border-b px-4 py-2 text-left"
              >
                {header.isPlaceholder ? null : (
                  <div
                    role="button"
                    tabIndex={0}
                    className={
                      header.column.getCanSort()
                        ? 'cursor-pointer select-none'
                        : ''
                    }
                    onClick={header.column.getToggleSortingHandler()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        const handler = header.column.getToggleSortingHandler()
                        if (handler) {
                          handler(e)
                        }
                      }
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row, index) => {
          const isHighlighted = parseInt(row.original.id.toString(), 10) <= 95
          const baseClass = isHighlighted
            ? 'bg-yellow-100'
            : index % 2 === 0
            ? 'bg-white'
            : 'bg-gray-50'
          return (
            <tr key={row.id} className={baseClass}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border-b px-4 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
