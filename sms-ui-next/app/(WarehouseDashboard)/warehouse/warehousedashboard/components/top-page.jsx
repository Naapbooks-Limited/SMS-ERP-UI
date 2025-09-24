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
import Pagination from "@/components/pagination/Pagination";

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
  cell: ({ row }) => {
    const uid = row.original.uid; // Access the actual UID from the row data
    return (
      <Link
        href={`/warehouse/warehouses/staff/staffDetail/${uid}`}
        className="text-primary hover:underline"
      >
        Details
      </Link>
    );
  },
}
];

const TopPage = ({ roleId}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bodyData, setBodyData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
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
  }, [currentPage]);

  const datas = {
    "roleId": 4,
    "desc": false,
    roletypeId
: 
null,
    "allRoles": true,
    "name": null,
    "accountstatus": null,
    "paginationFilter": {
      "pageNumber": currentPage,
      "pageSize": itemsPerPage
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
      setTotalPages(Math.ceil(response.data.totalCount / itemsPerPage));
      setLoading(false);
    } catch (error) {
      setError(error);
            setTotalPages(0);
      setLoading(false);
    }
  };

    const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

const table = useReactTable({
  data,
  columns,
  manualPagination: true, // important for server pagination
  pageCount: totalPages, // total pages from API
  state: {
    pagination: { pageIndex: currentPage - 1, pageSize: itemsPerPage },
  },
  onPaginationChange: (updater) => {
    const newState =
      typeof updater == "function"
        ? updater({ pageIndex: currentPage - 1, pageSize: itemsPerPage })
        : updater;
    setCurrentPage(newState.pageIndex + 1);
  },
  getCoreRowModel: getCoreRowModel(),
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
            ) : table?.getRowModel().rows?.length ? (
              table?.getRowModel().rows?.map((row) => (
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
     
      {data?.length > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      </div>
    </>
  );
};

export default TopPage;
