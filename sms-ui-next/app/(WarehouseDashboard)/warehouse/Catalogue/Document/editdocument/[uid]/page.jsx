"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { File, FileUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import CallFor from "@/utilities/CallFor";
import { toast as reToast } from "react-hot-toast";
import Select from "react-select";

const EditDocument = ({ params }) => {
  const router = useRouter();
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("");
  const [docdesc, setDocdesc] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [DocTypeList, setDocTypeList] = useState([]);
  const [selectedDocTypeId, setSelectedDocTypeId] = useState("");
  const [ProductList, setProductList] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [entityDocMapId, setEntityDocMapId] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});


  const fetchDocumentData = async () => {
    try {
      const response = await CallFor(`v2/document/GetDocumentByID?id=${params.uid}`, "GET", null, "Auth");
      const data = response.data.data;
      setDocName(data.name);
      setDocdesc(data.docDesc)
      setSelectedDocTypeId(data.docTypeId);
      setSelectedProductId(data.entityId);
      setSelectedCategory(data.entityTypeId);
      setEntityDocMapId(data.entityDocMapId);
      setDocumentId(data.docId);
      setSelectedFileName(data.docUrl.split('/').pop());
    } catch (error) {
      console.error("Error fetching document data:", error);
      setError("Failed to fetch document data");
    }
  };

  useEffect(() => {
    fetchDocumentData();
    fetchInitialData();
    // GetDocTypeList();
    GetProductList();
  }, [params.uid]);

  const fetchInitialData = async () => {
    try {
      const response = await CallFor("v2/document/SaveDocument", "GET", null, "Auth");

      if (response.data && response.data.mastervalues && response.data.mastervalues.entitytypeid) {
        const entityTypes = response.data.mastervalues.entitytypeid.mastervalues;
        const categoriesData = entityTypes.find(type => type.mastervalue1 === "Product");
        if (categoriesData) {
          setCategories([categoriesData]);
        }
        setDocTypeList(response.data.mastervalues.doctypeid.mastervalues);

      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const handleCancelBtn = (e) => {
    e.preventDefault();
    router.push("/warehouse/Catalogue/Document");
  };

  // const GetDocTypeList = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await CallFor("v2/document/GetDocTypeList", "GET", null, "Auth");
  //     setDocTypeList(response.data.data);
  //     setLoading(false);
  //   } catch (error) {
  //     setError(error.message);
  //     setLoading(false);
  //   }
  // };

  const GetProductList = async () => {
    setLoading(true);
    try {
      const response = await CallFor(`v2/Common/GetSkuDropDownList`, "get", null, "Auth");
      setProductList(
        response?.data?.map((product) => ({
          value: product.id,
          label: product.proname,
        }))
      );
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        setSelectedFile(null);
        setSelectedFileName("");
        setError("Please upload a file of type PDF, PNG, JPG, or XLSX.");
        return;
      }

      const maxSizeInMB = 2;
      if (file.size > maxSizeInMB * 1024 * 1024) {
        setSelectedFile(null);
        setSelectedFileName("");
        setError("File size must be less than 2MB.");
        return;
      }

      setSelectedFile(file);
      setSelectedFileName(file.name);
      setError("");
      setValidationErrors(prevErrors => {
        const { docimage, ...rest } = prevErrors; // Remove docimage from errors
        return rest;
      });
    }
  };

  const handleFileDelete = () => {
    setSelectedFile(null);
    setSelectedFileName("");
    setError("");
  };

  const validateForm = (fieldName, value) => {
    let errors = { ...validationErrors };

    // Validate each field based on the fieldName parameter
    if (fieldName === 'docName' || fieldName === undefined) {
      if (!docName && !value) {
        errors.docName = 'Enter a document name';
      } else {
        delete errors.docName;
      }
    }

    if (fieldName === 'docdesc' || fieldName === undefined) {
      if (!docdesc && !value) {
        errors.docdesc = 'Enter Description.';
      } else {
        delete errors.docdesc;
      }
    }

    if (fieldName === 'docType' || fieldName === undefined) {
      if (!selectedDocTypeId && !value) {
        errors.docType = 'Select Document Type';
      } else {
        delete errors.docType;
      }
    }

    if (fieldName === 'product' || fieldName === undefined) {
      if (!selectedProductId) {
        errors.product = 'select product.';
      } else {
        delete errors.product;
      }

    }
    if (fieldName === 'docimage' || fieldName === undefined) {
      if (!selectedFileName) {
        errors.docimage = 'Upload document image';
      } else {
        delete errors.docimage;
      }
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleUpdateBtn = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (!docName) {
        setError("Document name is required.");
        return;
      }

      setLoading(true);
      try {
        // Step 1: Update the document
        const formData = new FormData();
        if (selectedFile) {
          formData.append("docfile", selectedFile);
        }
        formData.append("docname", docName);
        formData.append("docid", documentId);
        formData.append("docdesc", docdesc);

        const updateResponse = await CallFor(
          "v2/document/UpdateDocument",
          "POST",
          formData,
          "authWithContentTypeMultipart"
        );

        console.log("Update Response:", updateResponse);

        // Step 2: Update the entity mapping
        const mappingData = {
          id: entityDocMapId,
          entityid: selectedProductId,
          documentid: documentId,
          entitytypeid: selectedCategory,
          documenttypeid: selectedDocTypeId
        };

        const mappingResponse = await CallFor(
          "v2/document/UpdateDocEntitiyMapping",
          "POST",
          mappingData,
          "Auth"
        );

        console.log("Mapping Response:", mappingResponse);

        if (mappingResponse) {
          reToast.success("Document updated successfully!");
          router.push("/warehouse/Catalogue/Document");
        } else {
          reToast.error("Error updating the document mapping.");
        }

      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
        reToast.error("Error updating the document.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="justify-between flex gap-1 pb-3">
        <div className="text-2xl text-orange-400">Edit DOCUMENT</div>
      </div>
      <form className="space-y-4">
        <div>
          <div>
            <div className="flex items-center mb-2">
              <label className="w-1/6 font-medium mr-2">Doc Name*</label>
              <input
                type="text"
                name="docName"
                className={` border px-4 py-2 w-3/4 ${validationErrors.docName ? `border-red-500 rounded` : 'border-gray-300 rounded'} `}
                placeholder="Enter document name"
                value={docName}
                onChange={(e) => { setDocName(e.target.value); validateForm('docName', e.target.value); }}
              />
            </div>
            {validationErrors.docName && (
              <div className="flex items-center mb-2 mt-1">
                <label className="w-1/6 font-medium mr-2"></label>
                <div className="text-red-500">  {validationErrors?.docName}</div>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center mb-2">
              <label className="w-1/6 font-medium mr-2">Doc Description*</label>
              <input
                type="text"
                className={` border px-4 py-2 w-3/4 ${validationErrors.docdesc ? `border-red-500 rounded` : 'border-gray-300 rounded'} `}
                placeholder="Enter document name"
                value={docdesc}
                name="docdesc"
                onChange={(e) => { setDocdesc(e.target.value); validateForm('docdesc', e.target.value) }}
              />
            </div>
            {validationErrors.docdesc && (

              <div className="flex items-center mb-2 mt-1">
                <label className="w-1/6 font-medium mr-2"></label>
                <div className="text-red-500">  {validationErrors.docdesc}</div>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center mb-2">
              <label className="w-1/6 font-medium mr-2">Doc Type*</label>
              <select
                name="docType"
                className={` border px-4 py-2 w-3/4 ${validationErrors.docType ? `border-red-500 rounded` : 'border-gray-300 rounded'} `}
                value={selectedDocTypeId}
                onChange={(e) => { setSelectedDocTypeId(e.target.value); validateForm('docType', e.target.value) }}
              >
                <option value="">Select Document Type</option>
                {DocTypeList &&
                  DocTypeList.map((type) => (
                    <option key={type.mvid} value={type.mvid}>
                      {type.mastervalue1}
                    </option>
                  ))}
              </select>
            </div>
            {validationErrors.docType && (

              <div className="flex items-center mb-2 mt-1">
                <label className="w-1/6 font-medium mr-2"></label>
                <div className="text-red-500"> {validationErrors.docType}</div>
              </div>

            )}
          </div>

          <div className="flex items-center mb-2">
            <label className="w-1/6 font-medium mr-2">Product*</label>
            <Select
              className={`w-3/4 z-20 text-black rounded ${validationErrors?.product ? " border border-red-500" : ""}`}
              options={ProductList}
              placeholder="select product"

              value={ProductList.find(option => option.value === selectedProductId)}
              onChange={(option) => {
                setSelectedProductId(option.value); setValidationErrors(prevErrors => {
                  const { product, ...rest } = prevErrors;
                  return rest;
                });
              }} />
          </div>

          <div className="flex items-center">
            <label className="w-1/6 font-medium mr-2">Upload File</label>
            <Label className="w-3/4 block">
              <Input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.xlsx"
                className="hidden"
                onChange={handleFileChange}
                name='docimage'
              />
              <Button
                asChild
                className="w-[100%] flex justify-end text-black dark:text-white border border-gray-300 hover:bg-transparent bg-transparent"
              >
                <div className="flex justify-between">
                  <div className="text-gray-400 font-normal">{selectedFile ? "" : "Upload file"}</div>
                  <FileUp size={20} className="dark:text-black" />
                </div>
              </Button>
            </Label>
          </div>

          <div className="flex items-center mb-2 mt-1">
            <label className="w-1/6 font-medium mr-2"></label>
            {selectedFileName && (
              <div className="flex text-gray-600 dark:text-white font-semibold items-center">
                <File size={20} className="mr-1" />
                {selectedFileName}
                <Trash2
                  size={20}
                  className="ml-1 text-warning cursor-pointer"
                  onClick={handleFileDelete}
                />
              </div>
            )}
          </div>
          {validationErrors?.docimage && (
            <div className="flex items-center mb-2 mt-1">
              <label className="w-1/6 font-medium mr-2"></label>
              <div className="text-red-500">{validationErrors?.docimage}</div>
            </div>
          )}
        </div>

        <div className="text-center">
          <Button
            className="text-white bg-blue-950 m-5"
            onClick={handleCancelBtn}
          >
            Cancel
          </Button>
          <Button
            className="text-white bg-orange-400"
            onClick={handleUpdateBtn}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </>
  );
};

export default EditDocument;