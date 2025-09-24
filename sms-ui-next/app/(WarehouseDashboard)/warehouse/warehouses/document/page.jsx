"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DownloadIcon,
  Eye,
  FilePenLine,
  Plus,
  SearchIcon,
  Trash,
} from "lucide-react";
import GlobalPropperties from "@/utilities/GlobalPropperties";
import Pagination from "@/components/pagination/Pagination";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CallFor from "@/utilities/CallFor";
import { saveAs } from "file-saver";
import DeleteDialog from "@/components/DeleteDialog";
import axios from "axios";

const Document = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  const [tempSearchFields, setTempSearchFields] = useState({
    Name: "",
    // UploadedBy: "",
    DocumentType: "",
  });
  const [searchParams, setSearchParams] = useState({
    entityid: null,
    entitytypeid: 98,
    docname: null,
    doctypeid: null,
    fromdate: "0001-01-01T00:00:00",
    todate: "0001-01-01T00:00:00"
  });
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [documentTypes, setDocumentTypes] = useState([]);

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const uoid = userData.orgid;

  useEffect(() => {
    fetchDropdownData();
    fetchData(currentPage);
  }, [currentPage, searchParams]);

  const fetchDropdownData = async () => {
    try {
      const response = await CallFor("v2/document/GetAllDocuments", "get", null, "Auth");

      setDocumentTypes(response.data.mastervalues.doctypeid.mastervalues);
    } catch (error) {
      console.error("Error fetching dropdown data", error);
    }
  };

  const fetchData = async (page) => {
    setLoading(true);
    try {
      const response = await CallFor(
        "v2/document/GetAllDocuments",
        "POST",
        {
          ...searchParams,
          paginationFilter: {
            pageNumber: page,
            pageSize: itemsPerPage
          }
        },
        "Auth"
      );
      if(response.data.data)
      {
        setData(response.data.data.data || []);
        setTotalPages(Math.ceil(response.data.data.totalCount / itemsPerPage));
        setLoading(false);
      }
      else{
        setData([])
      }
     
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = () => {
    setSearchParams({
      ...searchParams,
      docname: tempSearchFields.Name,
      doctypeid: parseInt(tempSearchFields.DocumentType),
    });
    setCurrentPage(1); // Reset to first page on search
  };

  const handleInputChange = (field, value) => {
    setTempSearchFields({ ...tempSearchFields, [field]: value });
  };

  const handleSort = (columnName) => {
    let direction = "asc";
    if (sortConfig.key === columnName && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: columnName, direction });
  };
  

  const sortedData = [...data].sort((a, b) => {
    const sortKey = sortConfig.key;
    if (!sortKey) return 0; // No sorting if key is not set
  
    let aValue = a[sortKey];
    let bValue = b[sortKey];
  
    if (sortKey === "uploadDate") {
      aValue = new Date(aValue); // Convert to Date object for proper comparison
      bValue = new Date(bValue);
    }
  
    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });
  

  const downloadDocument = async (docurl, filename, format) => {
    try {
      const response = await axios.get(
        GlobalPropperties.viewdocument + `${docurl}`,
        {
          responseType: "blob",
        }
      );

      let contentType = response.headers["content-type"];
      if (!contentType && format === "xlsx") {
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      }

      const blob = new Blob([response.data], { type: contentType });

      saveAs(blob, filename);
    } catch (error) {
      console.error("Error downloading the document", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="container mx-auto">
      <div className="flex">
        <SearchIcon className="text-gray-500" size={19} />
        <h1 className="text-[20px] font-semibold mb-4 pl-2">Search</h1>
      </div>
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-x-10">
        {Object.keys(tempSearchFields).map((field) => (
          <div key={field} className="flex items-center mb-2">
            <label className="w-1/4 font-medium mr-2">{field}</label>
            {field === "DocumentType" ? (
              <select
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                onChange={(e) => handleInputChange(field, e.target.value)}
              >
                <option value="">Select Document Type</option>
                {documentTypes.map((type) => (
                  <option key={type.mvid} value={type.mvid}>
                    {type.mastervalue1}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center lg:mb-1 mb-3 items-center">
        <Button
          color="warning"
          className="shadow-md w-28"
          onClick={handleSearch}
        >
          <SearchIcon size={20} className="pr-1" />
          Search
        </Button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl text-orange-400">Document List</div>
        <Button
          color="warning"
          className="shadow-md"
          onClick={() => router.push("/warehouse/warehouses/document/adddocument")}
        >
          <Plus size={20} className="pr-1" />
          Add
        </Button>
      </div>

      <table className="min-w-full text-left">
      <thead>
  <tr>
    <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("docid")}>
      Sr No. {sortConfig.key === "docid" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
    </th>
    <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("name")}>
      Name {sortConfig.key === "name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
    </th>
    <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("uploadDate")}>
      Uploaded Date {sortConfig.key === "uploadDate" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
    </th>
    <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("format")}>
      Format {sortConfig.key === "format" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
    </th>
    <th className="px-4 py-2">Action</th>
  </tr>
</thead>

        <tbody>
  {sortedData.map((row, index) => (
    <tr key={row.docid}>
      <td className="px-4 py-2">{index + 1}</td>
      <td className="px-4 py-2">{row.name}</td>
      <td className="px-4 py-2">{row.uploadDate}</td>
      <td className="px-4 py-2">{row.format}</td>
      <td className="px-4 py-2">
        <div className="flex items-center space-x-3">
          <Link href={`/warehouse/warehouses/document/viewdocument/${row.docId}`}>
            <Button className="p-0  bg-transparent hover:bg-transparent text-black dark:text-white">
              <Eye size={20}></Eye>
            </Button>
          </Link>
          <Link href={`/warehouse/warehouses/document/editdocument/${row.docId}`}>
            <button>
              <FilePenLine size={18} />
            </button>
          </Link>
          <button onClick={() => handleDeleteUser(row.docId)}>
            <Trash size={18} />
          </button>
          <button
            onClick={() => downloadDocument(row.docUrl, row.name, row.format)}
          >
            <DownloadIcon size={18} />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

      </table>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        callfor={CallFor}
        onDelete={() => {
          fetchData(currentPage);
          setIsDeleteDialogOpen(false);
        }}
        delUrl={`v2/document/DeleteDocument?id=${selectedUserId}`}
      />

      <div className="flex justify-end mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Document;
