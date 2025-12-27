import { Transfer } from "@/features/transferSlice";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { cn, getSize } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Progress } from "./ui/progress";

interface Props {
  data: Transfer[];
}

export default function TransferStatusTable({ data }: Props) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      size: undefined,
    },
  });

  return (
    <Table className="table-fixed w-full">
      <TableHeader className="bg-background sticky top-0 z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const size = header.column.columnDef.size;

              return (
                <TableHead
                  key={header.id}
                  style={{
                    width: size ? `${size}px` : "auto",
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No objects
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

const columns: ColumnDef<Transfer>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => <div className="truncate">{row.getValue("name")}</div>,
  },
  {
    header: "Size",
    accessorKey: "totalSize",
    cell: ({ row }) => {
      const { transferredSize, totalSize, status } = row.original;

      if (status === "finished") {
        return <>{getSize(totalSize)}</>;
      } else {
        return <>{`${getSize(transferredSize)} / ${getSize(totalSize)}`}</>;
      }
    },
    size: 160,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const {
        type,
        status,
        finishDate,
        totalSize,
        transferredSize,
        increment,
        id,
      } = row.original;

      if (status === "finished") {
        let Icon, text;
        switch (type) {
          case "download":
            Icon = ArrowDown;
            text = "Downloaded";
            break;
          case "upload":
            Icon = ArrowUp;
            text = "Uploaded";
            break;
        }
        return (
          <div className="flex items-center gap-1">
            <Icon className="text-blue-500" size={16} strokeWidth={2} />
            {text}
            <span className="w-5" />
            {finishDate}
          </div>
        );
      } else {
        let TransferStatus;
        if (status === "stopping") {
          TransferStatus = <>Stopped</>;
        } else {
          if (increment !== undefined) {
            TransferStatus = <>{`${getSize(increment)}/s`}</>;
          } else {
            TransferStatus = <>Requesting...</>;
          }
        }

        return (
          <div className="pr-4" key={id}>
            <Progress value={Math.round((transferredSize / totalSize) * 100)} />
            <p className="text-[12px]">{TransferStatus}</p>
          </div>
        );
      }
    },
    size: 240,
  },
  {
    header: "Actions",
    size: 140,
  },
];
