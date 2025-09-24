"use client"
import React, { useState, useEffect } from "react";
import Select from 'react-select';
import { Button } from "@/components/ui/button";
import GlobalPropperties from "@/utilities/GlobalPropperties";
import {
  Check,
  Download,
  Eye,
  FilePenLine,
  Plus,
  Search as SearchIcon,
  Trash,
  Upload,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import Link from "next/link";
import CallFor from "@/utilities/CallFor";
import Pagination from "@/components/pagination/Pagination";
import DeleteDialog from "@/components/DeleteDialog";
import axios from "axios";
import ImportModal from "@/components/Importmodel/importmodel";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import CallFor2 from "@/utilities/CallFor2";

const Product = () => {
  const getToken = () => {
    const user = sessionStorage.getItem('userData') || null;
    const data = user ? JSON.parse(user) : null;
    return data ? data?.nopVendorId : null;
  }

  // Token for ShopMyStation APIs (uses 'Token' header with nopToken)
  const getNopToken = () => {
    try {
      const raw = sessionStorage.getItem('nopToken') || null;
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return typeof parsed === 'string' && parsed.length > 0 ? parsed : null;
    } catch {
      return null;
    }
  };
  
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [exportUrl, setExportUrl] = useState("");
  const [importFileUrl, setImportFileUrl] = useState("");
  const [sampleFileUrl, setSampleFileUrl] = useState("");

  const [filterData, setFilterData] = useState({
    categories: [],
    manufacturer: [],
    skustatus: []
  });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filterModel, setFilterModel] = useState({
    pvname: null,
    catid: null,
    subcatid: null,
    manufacturer: null,
    skustatus: 88
  });
  
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [selectedPvid, setSelectedPvid] = useState(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // Import related states
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const Uid = userData.uid;

  const getStyles = (isDark) => ({
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDark ? "#333" : "#fff",
      color: isDark ? "white" : "#333",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: isDark 
        ? (state.isSelected ? "#555" : "#333")
        : (state.isSelected ? "#f0f0f0" : "#fff"),
      color: isDark ? "white" : "#333",
    }),
    control: (provided) => ({
      ...provided,
      backgroundColor: isDark ? "#333" : "#fff",
      color: isDark ? "white" : "#333",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDark ? "white" : "#333",
    }),
  });

  useEffect(() => {
    fetchDataGet();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const fetchDataGet = async () => {
    try {
      setLoading(true);
      const url = `v2/Product/GetProductsList`;
      const response = await CallFor(url, "get", null, "Auth");

      setExportUrl(response.data.excelExportApi);
      setImportFileUrl(response.data.excelImportApi);
      setSampleFileUrl(response.data.sampleFile);

      setFilterData({
        categories: response.data.dropdowns.categories,
        manufacturer: response.data.dropdowns.manufacturer,
        skustatus: response.data.dropdowns.skustatus.mastervalues
      });
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  // Updated Export function using CallFor
const handleExport = async () => {
  try {
    setLoading(true);

    const exportParams = {
      searchProductName: "",
      searchCategoryId: 0,
      searchIncludeSubCategories: false,
      searchManufacturerId: 0,
      searchStoreId: 0,
      searchVendorId: userData?.nopVendorId,
      searchWarehouseId: 0,
      searchProductTypeId: 0,
      searchPublishedId: 0,
      goDirectlyToSku: "",
      isLoggedInAsVendor: false,
      allowVendorsToImportProducts: false,
      licenseCheckModel: {},
      hideStoresList: false,
      availableCategories: [],
      availableManufacturers: [],
      availableStores: [],
      availableWarehouses: [],
      availableVendors: [],
      availableProductTypes: [],
      availablePublishedOptions: []
    };

    const response = await CallFor2(
      'admin-api/Product/export-excel-all',
      'POST',
      exportParams,
      'Auth',
      'blob' // 🔹 explicitly tell CallFor2 we want a blob
    );

    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const blob = new Blob(
      [response.data],
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    );

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `products_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);

    console.log('Export successful');
  } catch (error) {
    console.error("Export failed:", error);
  } finally {
    setLoading(false);
  }
};




  // Import function using CallFor
  const handleImport = async () => {
    if (!importFile) {
      alert("Please select a file to import");
      return;
    }

    try {
      setImportLoading(true);
      
      const formData = new FormData();
      formData.append('importexcelfile', importFile);

      const response = await CallFor2(
        'admin-api/Product/import-excel',
        'POST',
        formData,
        'authWithContentTypeMultipart'
      );

      if (response) {
        alert("Import successful!");
        setIsImportDialogOpen(false);
        setImportFile(null);
        fetchData(); // Refresh the product list
      } else {
        alert(response.message || "Import failed. Please check your file format.");
      }

      setImportLoading(false);
    } catch (error) {
      console.error("Import failed:", error);
      alert("Import failed. Please try again.");
      setImportLoading(false);
    }
  };

 // Download sample file from GlobalPropperties base via POST, attaching 'Token' header (nopToken)
 const handleDownloadSample = async () => {
  try {
    const token = getNopToken();
    if (!token) {
      alert("You're not authenticated. Please login again.");
      return;
    }

    const downloadUrl = `${GlobalPropperties.ezeo_shopmystation}admin-api/Product/export-excel-all`;

    // Reuse same export params as the Export action
    const exportParams = {
      searchProductName: "",
      searchCategoryId: 0,
      searchIncludeSubCategories: false,
      searchManufacturerId: 0,
      searchStoreId: 0,
      searchVendorId: userData?.nopVendorId,
      searchWarehouseId: 0,
      searchProductTypeId: 0,
      searchPublishedId: 0,
      goDirectlyToSku: "",
      isLoggedInAsVendor: false,
      allowVendorsToImportProducts: false,
      licenseCheckModel: {},
      hideStoresList: false,
      availableCategories: [],
      availableManufacturers: [],
      availableStores: [],
      availableWarehouses: [],
      availableVendors: [],
      availableProductTypes: [],
      availablePublishedOptions: []
    };

    const response = await axios({
      url: downloadUrl,
      method: 'POST',
      data: exportParams,
      responseType: 'blob',
      headers: {
        Token: token,
        'Content-Type': 'application/json',
      },
    });

    const contentDisposition = response.headers['content-disposition'];
    let filename = 'product_import_sample.xlsx';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename=\"?(.+)\"?/i);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Sample download failed:", error);
    alert("Failed to download sample file");
  }
};


  const handleImportSuccess = (data) => {
    console.log('Import successful:', data);
    fetchData(); // Refresh the products list after successful import
  };

  const fetchData = async () => {
    try {
      const filtermodel = {...filterModel, paginationFilter: {
        pageNumber: page,
        pageSize: pageSize,
      }}

      setLoading(true);
      const url = `v2/Product/GetProductVariants`;
      const response = await CallFor(url, "POST", filtermodel, "Auth");

      if(response.data.data) {
        setData(response.data.data.data);
        setTotalPages(Math.ceil(response.data.data.totalCount / pageSize));
      } else {
        setData([]);
        setTotalPages("");
      }
      
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  const handleInputChange = (field, value) => {
    if (field === "manufacturer") {
      const selectedManufacturer = filterData.manufacturer.find(m => m.id === value);
      setFilterModel(prev => ({
        ...prev,
        [field]: selectedManufacturer ? selectedManufacturer.name : null
      }));
    } else if (field === "catid") {
      setFilterModel(prev => ({
        ...prev,
        catid: value,
        subcatid: null
      }));
    } else {
      setFilterModel(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSort = (columnName) => {
    let direction = "asc";
    if (sortConfig.key === columnName && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedData = [...data].sort((a, b) => {
      if (a[columnName] < b[columnName]) {
        return direction === "asc" ? -1 : 1;
      }
      if (a[columnName] > b[columnName]) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setSortConfig({ key: columnName, direction });
    setData(sortedData);
  };

  const handleDeleteUser = (userId) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleSearch = () => {
    fetchData();
  };

  const getCurrentStockQuantity = (currentStock) => {
    if (!currentStock || currentStock.length === 0) return 0;
    return currentStock.reduce((total, stock) => total + (stock.sqty || 0), 0);
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return `${price.toFixed(2)}`;
  };

  const styles = getStyles(theme === "dark");

  const handleImageUpload = async (pvid) => {
    try {
      const currentItem = data.find(item => item.pvid === pvid);
      if (!currentItem) {
        console.error('Product not found');
        return;
      }

      const formData = new FormData();
      
      selectedFiles.forEach((file, index) => {
        formData.append(`productImgModelList[${index}].Umid`, "0");
        formData.append(`productImgModelList[${index}].Umname`, file.name);
        formData.append(`productImgModelList[${index}].Umalttext`, file.name);
        formData.append(`productImgModelList[${index}].Umtype`, "2");
        formData.append(`productImgModelList[${index}].Uid`, Uid);
        formData.append(`productImgModelList[${index}].Umurl`, file);
        formData.append(`productImgModelList[${index}].Umsizes`, "0");
        formData.append(`productImgModelList[${index}].Umbytes`, "0");
      });

      const response = await CallFor(
        'v2/Product/SaveMultipleProductImages',
        'POST',
        formData,
        'authWithContentTypeMultipart'
      );

      if (response && response.data && response.data.data) {
        const bulkMappingData = response.data.data.map(img => ({
          pvumid: 0,
          proid: currentItem.proid,
          pvid: pvid,
          productimgid: img.productimgid
        }));

        const mappingResponse = await CallFor(
          'v2/Product/SaveBulkProductImageMapping',
          'POST',
          bulkMappingData,
          'Auth'
        );

        if (mappingResponse) {
          console.log('Images uploaded and mapped successfully');
          setIsImageDialogOpen(false);
          setSelectedFiles([]);
          setSelectedPvid(null);
          fetchData();
        } else {
          console.error('Failed to map images');
        }
      } else {
        console.error('Failed to upload images or invalid response format');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex ">
        <SearchIcon className="text-gray-500" size={19} />
        <h1 className="text-[20px] font-semibold mb-4 pl-2">Search</h1>
      </div>

      <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-x-10">
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Product Name</label>
          <input
            type="text"
            value={filterModel.pvname || ""}
            className="border border-gray-300 px-4 py-2 rounded w-3/4"
            onChange={(e) => handleInputChange("pvname", e.target.value)}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Category</label>
          <Select
            options={filterData.categories.map((cat) => ({
              value: cat.id,
              label: cat.name,
            }))}
            value={
              filterModel.catid
                ? {
                    value: filterModel.catid,
                    label: filterData.categories.find(
                      (c) => c.id === filterModel.catid
                    )?.name,
                  }
                : null
            }
            onChange={(selected) =>
              handleInputChange("catid", selected ? selected.value : null)
            }
            className="w-3/4"
            isClearable
            styles={styles}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Subcategory</label>
          <Select
            options={
              filterData.categories
                .find((c) => c.id === filterModel.catid)
                ?.subdata.map((sub) => ({ value: sub.id, label: sub.name })) ||
              []
            }
            value={
              filterModel.subcatid
                ? {
                    value: filterModel.subcatid,
                    label: filterData.categories
                      .find((c) => c.id === filterModel.catid)
                      ?.subdata.find((s) => s.id === filterModel.subcatid)
                      ?.name,
                  }
                : null
            }
            onChange={(selected) =>
              handleInputChange("subcatid", selected ? selected.value : null)
            }
            className="w-3/4"
            isClearable
            styles={styles}
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="w-1/4 font-medium mr-2">Manufacturer</label>
          <Select
            options={filterData.manufacturer.map((m) => ({
              value: m.id,
              label: m.name,
            }))}
            value={
              filterModel.manufacturer
                ? {
                    value: filterData.manufacturer.find(
                      (m) => m.name === filterModel.manufacturer
                    )?.id,
                    label: filterModel.manufacturer,
                  }
                : null
            }
            onChange={(selected) =>
              handleInputChange(
                "manufacturer",
                selected ? selected.value : null
              )
            }
            className="w-3/4"
            isClearable
            styles={styles}
          />
        </div>
      </div>

      <div className="flex justify-center mb-3 items-center">
        <Button color="warning" className="shadow-md w-28" onClick={fetchData}>
          <SearchIcon size={20} className="pr-1" />
          Search
        </Button>
      </div>

      <div className="flex justify-between items-center pb-3">
        <div className="text-2xl text-orange-400">Products List</div>
        <div className="flex items-center space-x-2">
          {/* Import Button */}
          <Button
            color="primary"
            className="shadow-md"
            onClick={() => setIsImportDialogOpen(true)}
            disabled={loading}
          >
            <Upload size={20} className="mr-2" />
            Import
          </Button>
          
          {/* Export Button */}
          <Button
            color="destructive"
            className="shadow-md"
            onClick={handleExport}
            disabled={loading}
          >
            <Download size={20} className="mr-2" />
            Export
          </Button>
          
          <Link href="/station/Catalogue/Products/productadd">
            <Button color="warning" className="shadow-md">
              <Plus size={20} className="pr-1" />
              Add
            </Button>
          </Link>
        </div>
      </div>

      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("proid")}
            >
              SR.NO{" "}
              {sortConfig.key === "proid"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th className="px-2 py-2 cursor-pointer">PICTURE</th>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("pvname")}
            >
              PRODUCTS NAME{" "}
              {sortConfig.key === "pvname"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("pvpurchaseprice")}
            >
              SALES PRICE{" "}
              {sortConfig.key === "pvpurchaseprice"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              className="px-2 py-2 cursor-pointer"
              onClick={() => handleSort("currentStock")}
            >
              STOCK QUANTITY{" "}
              {sortConfig.key === "currentStock"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th className="px-2 py-2 cursor-pointer">PUBLISHED</th>
            <th className="px-2 py-2 cursor-pointer">ACTION</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-6 text-gray-500">
                No data found
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.pvid}>
                <td className="px-2 py-2">{item.proid}</td>
                <td className="px-2 py-2">
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger>
                        <div className="relative group">
                          <div className="relative">
                            <img
                              src={`${GlobalPropperties.viewdocument}${
                                item.productImageUrl && item.productImageUrl.length > 0
                                  ? item.productImageUrl[0]
                                  : item.pvdefaultimgUmUrl
                              }`}
                              alt={item.pvname}
                              className="w-24 h-24 object-cover rounded-md shadow-md"
                            />
                            {item.productImageUrl &&
                              item.productImageUrl.length > 0 && (
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                  <div className="text-white flex items-center">
                                    <Plus className="w-5 h-5" />
                                    <span className="ml-1">
                                      {item.productImageUrl.length}
                                    </span>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      {item.productImageUrl && item.productImageUrl.length > 0 && (
                        <TooltipContent
                          side="right"
                          className="p-2 bg-white shadow-lg rounded-lg"
                        >
                          <div className="grid grid-cols-3 gap-2">
                            {item.productImageUrl.slice(0, 6).map((imgUrl, index) => (
                              <img
                                key={index}
                                src={`${GlobalPropperties.viewdocument}${imgUrl}`}
                                alt={`${item.pvname} ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                            ))}
                            {item.productImageUrl.length > 6 && (
                              <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                                <span className="text-sm text-gray-500">
                                  +{item.productImageUrl.length - 6}
                                </span>
                              </div>
                            )}
                            <Button
                              className="mt-2 bg-transparent hover:bg-transparent text-black dark:text-white"
                              onClick={() => {
                                setSelectedPvid(item.pvid);
                                setIsImageDialogOpen(true);
                              }}
                            >
                              <Upload size={20} />
                            </Button>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="px-2 py-2">{item.pvname || "N/A"}</td>
                <td className="px-2 py-2">{formatPrice(item.pvsalesprice)}</td>
                <td className="px-2 py-2 text-center">{item?.closingstock}</td>
                <td className="px-2 py-2 text-center">
                  {item.isPublished ? "Yes" : "No"}
                </td>
                <td className="px-2 py-2">
                  <div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={`/station/Catalogue/Products/viewproductvariant/${item.pvid}`}
                          >
                            <Button className="p-0 mr-2 bg-transparent hover:bg-transparent text-black dark:text-white">
                              <Eye size={20} />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent color="primary">
                          <p>View</p>
                          <TooltipArrow className="fill-primary" />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={`/station/Catalogue/Products/editproduct/${item.pvid}`}
                          >
                            <Button className="p-0 mr-2 bg-transparent hover:bg-transparent text-black dark:text-white">
                              <FilePenLine size={20} />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent color="primary">
                          <p>Edit</p>
                          <TooltipArrow className="fill-primary" />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className="p-0 bg-transparent hover:bg-transparent text-black dark:text-white"
                            onClick={() => handleDeleteUser(item.pvid)}
                          >
                            <Trash size={20} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent color="primary">
                          <p>Delete</p>
                          <TooltipArrow className="fill-primary" />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        callfor={CallFor}
        onDelete={() => {
          fetchData();
          setIsDeleteDialogOpen(false);
        }}
        delUrl={`v2/Product/DeleteProvariantbyuoid?pvid=${selectedUserId}`}
      />

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Products</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Select an Excel file (.xlsx, .xls) to import products
              </p>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files[0])}
              />
            </div>
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleDownloadSample}
                size="sm"
              >
                <Download size={16} className="mr-2" />
                Download Sample
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImportDialogOpen(false);
                setImportFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!importFile || importLoading}
            >
              {importLoading ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Images</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              multiple
              onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
              accept="image/*"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsImageDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleImageUpload(selectedPvid)}
                disabled={!selectedFiles.length}
              >
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Product;