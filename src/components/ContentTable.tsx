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
} from "@/components/ui/table";
import { Content, useListContentsQuery } from "@/api/s3Api";
import { Button } from "./ui/button";
import { File, Folder } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hook";
import { useCallback, useMemo } from "react";
import { S3Action } from "@/features/s3Slice";
import { getFileType, getSize } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";

const defaultData: Content[] = [];

export default function ContentTable() {
  const folder = useAppSelector((state) => state.s3.folder);
  const { data, isFetching, error } = useListContentsQuery(folder);

  const dispatch = useAppDispatch();

  const onFolderClick = useCallback((prefix: string) => {
    console.log("folder + prefix", folder, prefix);

    dispatch(S3Action.setFolder(folder + prefix));
  }, []);

  const columns = useMemo(
    () => createColumn({ onFolderClick }),
    [onFolderClick]
  );

  const table = useReactTable({
    data: data ?? defaultData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader className="bg-background sticky top-0 z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
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
        {error !== undefined ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              Please login.
            </TableCell>
          </TableRow>
        ) : isFetching ? (
          <></>
        ) : table.getRowModel().rows?.length ? (
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

function createColumn(props: {
  onFolderClick: (prefix: string) => void;
}): ColumnDef<Content>[] {
  return [
    {
      id: "select",
      header: ({ table }) => {
        return (
          <Checkbox
            checked={
              table.getIsAllRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        );
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => {
        const { type, name } = row.original;

        let cellComponent;

        if (type === "folder") {
          cellComponent = (
            <>
              <Folder className="w-4 h-4" />
              <Button
                className="p-0 h-auto font-normal text-foreground underline"
                variant={"link"}
                onClick={() => {
                  props.onFolderClick(name);
                }}
              >
                {name}
              </Button>
            </>
          );
        } else {
          cellComponent = (
            <>
              <File className="w-4 h-4" />
              <span className="text-sm">{name}</span>
            </>
          );
        }

        return <div className="flex items-center gap-2">{cellComponent}</div>;
      },
    },
    {
      header: "Type",
      accessorFn: (row) => {
        if (row.type === "folder") return row.type;
        return getFileType(row.type);
      },
      cell: ({ row }) => {
        const { type, name } = row.original;
        if (type === "folder") return <>{"folder"}</>;

        return <>{getFileType(name)}</>;
      },
    },
    {
      header: "Size",
      accessorKey: "size",
      cell: ({ row }) => {
        const { type } = row.original;

        if (type === "folder") {
          return <>-</>;
        }

        const size = row.getValue<number>("size");
        return <>{getSize(size)}</>;
      },
    },
    {
      header: "Last modified",
      accessorKey: "lastModified",
    },
  ];
}
