"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { File, FileUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import CallFor from "@/utilities/CallFor";
import { toast as reToast } from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";

const AddDocument = ({ params }) => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [selectedFileName2, setSelectedFileName2] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [DocTypeList, setDocTypeList] = useState([]);
  const [documentData, setDocumentData] = useState({});

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const uoid = userData.orgid;

  const fetchInitialData = async () => {
    try {
      const response = await CallFor(
        "v2/document/SaveDocument",
        "GET",
        null,
        "Auth"
      );

      if (response.data) {
        setDocTypeList(response.data.mastervalues.doctypeid.mastervalues);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    formik.setFieldValue("selectedFileName2", selectedFileName2);
  }, [selectedFileName2]);

  console.log(selectedFile, "selectedFile")
  console.log(selectedFileName, "selectedFileName ");
  console.log(selectedFileName2, "selectedFileName2")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await CallFor(
          `v2/document/GetDocumentByID?id=${params.uid}`,
          "GET",
          null,
          "Auth"
        );
        const fetchedData = response.data.data;
        setDocumentData(fetchedData);
        formik.setFieldValue("docName", fetchedData.name);
        formik.setFieldValue("docdesc", fetchedData.docDesc);
        setSelectedFileName2(fetchedData.docUrl);

        const docTypeResponse = await CallFor(
          "v2/document/SaveDocument",
          "GET",
          null,
          "Auth"
        );

        if (docTypeResponse.data) {
          const docTypeData =
            docTypeResponse.data.mastervalues.doctypeid.mastervalues.find(
              (v) => v.mastervalue1 === fetchedData.docType
            );
          formik.setFieldValue("selectedDocTypeId", docTypeData.mvid);
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.uid]);

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
        setSelectedFileName(""); // Clear the filename
        formik.setFieldError(
          "selectedFile",
          "Please upload a file of type PDF, PNG, JPG, or XLSX."
        );
        return;
      }

      const maxSizeInMB = 2;
      if (file.size > maxSizeInMB * 1024 * 1024) {
        setSelectedFile(null);
        setSelectedFileName(""); // Clear the filename
        formik.setFieldError("selectedFile", "File size must be less than 2MB.");
        return;
      }

      setSelectedFile(file);
      setSelectedFileName(file.name); // Set the filename
      formik.setFieldValue("selectedFile", file);
      formik.setFieldError("selectedFile", ""); // Clear the error
    }
  };



  const handleCancelBtn = (e) => {
    e.preventDefault();
    router.push("/station/station/document");
  };

  const handleFileDelete = () => {
    setSelectedFile(null);
    setSelectedFileName("");
    setSelectedFileName2("");
    formik.setFieldValue("selectedFile", null);
    formik.setFieldError("selectedFile", ""); // Clear the error
  };

  const validate = (values) => {
    const errors = {};

    if (!values.docName) {
      errors.docName = "Document Name is required";
    }

    if (!values.selectedDocTypeId) {
      errors.selectedDocTypeId = "Document Type is required";
    }

    if (!values.selectedFile && !selectedFileName2) {
      errors.selectedFile = "Please upload a file.";
    }

    return errors;
  };

  const formik = useFormik({
    initialValues: {
      docName: "",
      docdesc:"",
      selectedDocTypeId: "",
      selectedFile: null,
    },
    validate,

    onSubmit: async (values) => {
      if (!selectedFile && !selectedFileName2) {
        formik.setFieldError("selectedFile", "Please upload a file.");
        return;
      }

      const formData = new FormData();
      if (selectedFile) {
        formData.append("docfile", selectedFile);
      } else {
        formData.append("docurl", selectedFileName2);
      }
      formData.append("docname", values.docName);
      formData.append("docdesc", values.docdesc);
      formData.append("doctypeid", values.selectedDocTypeId);
      formData.append("docid", params.uid);
      formData.append("entityid", uoid);
      formData.append("entitytypeid", 98);

      setLoading(true);
      try {
        const response = await CallFor(
          "v2/document/UpdateDocument",
          "POST",
          formData,
          "authWithContentTypeMultipart"
        );

        if (response.data) {
          const mappingBody = {
            id: documentData.entityDocMapId,
            entityid: uoid,
            documentid: parseInt(params.uid),
            entitytypeid: 98,
            documenttypeid: values.selectedDocTypeId,
          };

          const mappingResponse = await CallFor(
            "v2/document/UpdateDocEntitiyMapping",
            "POST",
            mappingBody,
            "Auth"
          );

          if (mappingResponse.data.status) {
            reToast.success("Document saved successfully!");
            router.push("/station/station/document");
          } else {
            reToast.error("Error saving document mapping.");
          }
        } else {
          reToast.error("Error saving Document.");
        }
      } catch (error) {
        formik.setFieldError("apiError", error.message);
      } finally {
        setLoading(false);
      }
    },
  });



  return (
    <>
      <div className="justify-between flex gap-1 pb-3">
        <div className="text-2xl text-orange-400">Upload DOCUMENT</div>
      </div>
      <form className="space-y-4" onSubmit={formik.handleSubmit}>
        <div>
          <div className="flex items-center mb-2">
            <label className="w-1/6 font-medium mr-2">Doc Name*</label>
            <input
              type="text"
              className="border border-gray-300 px-4 py-2 rounded w-3/4"
              placeholder="Enter document name"
              {...formik.getFieldProps("docName")}
            />
          </div>
          {formik.touched.docName && formik.errors.docName ? (
            <div className="text-red-500 ml-[16.66%] mb-2">
              {formik.errors.docName}
            </div>
          ) : null}


<div className="flex items-center mb-2">
            <label className="w-1/6 font-medium mr-2">Doc Description*</label>
            <input
              type="text"
              className="border border-gray-300 px-4 py-2 rounded w-3/4"
              placeholder="Enter document Disc"
              {...formik.getFieldProps("docdesc")}
            />
          </div>
          {formik.touched.docName && formik.errors.docName ? (
            <div className="text-red-500 ml-[16.66%] mb-2">
              {formik.errors.docName}
            </div>
          ) : null}

          <div className="flex items-center mb-2">
            <label className="w-1/6 font-medium mr-2">Doc Type*</label>
            <select
              className="border border-gray-300 px-4 py-2 rounded w-3/4"
              {...formik.getFieldProps("selectedDocTypeId")}
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
          {formik.touched.selectedDocTypeId &&
            formik.errors.selectedDocTypeId ? (
            <div className="text-red-500 ml-[16.66%] mb-2">
              {formik.errors.selectedDocTypeId}
            </div>
          ) : null}

          <div className="flex items-center">
            <label className="w-1/6 font-medium mr-2">Upload File*</label>
            <Label className="w-3/4 block">
              <Input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                asChild
                className="w-[100%] flex justify-end text-black dark:text-white border border-gray-300 hover:bg-transparent bg-transparent"
              >
                <div>
                  <FileUp size={20} />
                </div>
              </Button>
            </Label>
          </div>
          <div className="flex items-center mb-2 mt-1">
            <label className="w-1/6 font-medium mr-2"></label>
            {selectedFileName || selectedFileName2 ? (
              <div className="flex text-gray-600 dark:text-white font-semibold items-center">
                <File size={20} className="mr-1" />
                {selectedFileName || selectedFileName2}
                <Trash2
                  size={20}
                  className="ml-1 text-warning cursor-pointer"
                  onClick={handleFileDelete}
                />
              </div>
            ) : null}
          </div>
          {console.log(formik.errors.selectedFile, "formik.errors.selectedFile")}
          {formik.touched.selectedFile && formik.errors.selectedFile ? (
            <div className="text-red-500 ml-[16.66%] mb-2">
              {formik.errors.selectedFile}
            </div>
          ) : null}
        </div>

        <div className="text-center">
          <Button
            className="text-white bg-blue-950 m-5"
            onClick={handleCancelBtn}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="text-white bg-orange-400"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </>
  );
};

export default AddDocument;

