"use client"
import * as React from "react";
import { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import CallFor from "@/utilities/CallFor";


const columns = [
  {
    accessorKey: "uid",
    header: "Sr No",
    cell: ({ row }) => <span>{row.index + 1}</span>,
  },
  {
    accessorKey: "fullname",
    header: "Name",
  },
  {
    accessorKey: "mobno",
    header: "Phone No",
  },
  {
    accessorKey: "rolename",
    header: "Role Name",
  },
  {
    accessorKey: "id",
    header: "Action",
    cell: ({ row }) => (
      <Link href="#" className="text-primary hover:underline">Details</Link>
    ),
  },
];

const TopPage = ({ roleId, itemsPerPage = 10 }) => {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bodyData, setBodyData] = useState(null);

  // const fetchBodyData = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await CallFor("v2/users/GetUsersByRoleId", "get", null, "Auth");
  //     console.log(response.data.model)
  //     setBodyData(response.data);
  //     setLoading(false);
  //   } catch (error) {
  //     setError(error);
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchBodyData();
  // }, []);

  

  useEffect(() => {
    fetchData();
  }, []);

  const datas = {
    "roleId": 0,
    "desc": false,
    "allRoles": true,
    "name": null,
    "accountstatus": null,
    "paginationFilter": {
      "pageNumber": 1,
      "pageSize": 100
    }
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await CallFor(
        `v2/users/GetUsersByRoleId`,
        "POST",
        datas,
        "Auth"
      );
      setData(response.data.data);
      // setTotalPages(Math.ceil(response.data.totalCount / itemsPerPage));
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: { pageIndex: currentPage, pageSize: itemsPerPage },
    },
  });

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-default-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-sm font-semibold text-default-600 bg-default-200 h-12 last:text-end last:pr-7">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="[&_tr:last-child]:border-1">
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-default-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-sm text-default-700 border-b border-default-100 dark:border-default-200 last:text-end last:pr-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        <Button size="icon" className="h-7 w-7 bg-default-100 text-default-600 hover:text-primary-foreground" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0}>
          <Icon icon="heroicons:chevron-left" className="w-3.5 h-3.5" />
        </Button>
        <ul className="flex space-x-3 rtl:space-x-reverse items-center">
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <li key={pageIndex}>
              <Button
                onClick={() => setCurrentPage(pageIndex)}
                aria-current={pageIndex === currentPage ? "page" : undefined}
                className={cn("h-7 w-7 bg-default-100 text-default-600 p-0 hover:bg-opacity-70 hover:text-primary-foreground", {
                  "bg-primary text-primary-foreground": pageIndex === currentPage,
                })}
              >
                {pageIndex + 1}
              </Button>
            </li>
          ))}
        </ul>
        <Button size="icon" className="h-7 w-7 bg-default-100 text-default-600 hover:text-primary-foreground" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages - 1}>
          <Icon icon="heroicons:chevron-right" className="w-3.5 h-3.5" />
        </Button>
      </div>
    </>
  );
};

export default TopPage;
