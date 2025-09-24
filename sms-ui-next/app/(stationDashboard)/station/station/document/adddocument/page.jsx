"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { File, FileUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import CallFor from "@/utilities/CallFor";
import { toast as reToast } from "react-hot-toast";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";

// Validation schema
const validationSchema = Yup.object().shape({
  docName: Yup.string().required("Document name is required."),
  docdesc: Yup.string().required("Document Description name is required."),
  selectedDocTypeId: Yup.string().required("Document type is required."),
  selectedFileName: Yup.string().required("File upload is required."),
});

const AddDocument = () => {
  const router = useRouter();
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [DocTypeList, setDocTypeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchInitialData = async () => {
    try {
      const response = await CallFor("v2/document/SaveDocument", "GET", null, "Auth");

      if (response.data && response.data.mastervalues && response.data.mastervalues.entitytypeid) {
        const entityTypes = response.data.mastervalues.entitytypeid.mastervalues;
        const categoriesData = entityTypes.find(type => type.mastervalue1 === "Product");
        console.log(categoriesData.mvid);
        if (categoriesData) {
          setCategories([categoriesData]);
          setSelectedCategory(categoriesData.mvid);
        }

        setDocTypeList(response.data.mastervalues.doctypeid.mastervalues);

      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleFileChange = (e, setFieldValue) => {
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
        setFieldValue("selectedFileName", "");
        reToast.error("Please upload a file of type PDF, PNG, JPG, or XLSX.");
        return;
      }

      const maxSizeInMB = 2;
      if (file.size > maxSizeInMB * 1024 * 1024) {
        setSelectedFile(null);
        setSelectedFileName("");
        setFieldValue("selectedFileName", "");
        reToast.error("File size must be less than 2MB.");
        return;
      }

      setSelectedFile(file);
      setSelectedFileName(file.name);
      setFieldValue("selectedFileName", file.name);
    }
  };

  const handleFileDelete = (setFieldValue) => {
    setSelectedFile(null);
    setSelectedFileName("");
    setFieldValue("selectedFileName", "");
  };

  const handleSaveBtn = async (values) => {
    setLoading(true);
    try {
      // Step 1: Upload the document
      const formData = new FormData();
      formData.append("docfile", selectedFile);
      formData.append("docname", values.docName);
      formData.append("docdesc", values.docdesc);

      const uploadResponse = await CallFor(
        "v2/document/SaveDocument",
        "POST",
        formData,
        "authWithContentTypeMultipart"
      );

      console.log("Upload Response:", uploadResponse);

      if (!uploadResponse || !uploadResponse.data.data) {
        throw new Error("Failed to get DocumentId from upload response");
      }

      const documentId = uploadResponse.data.data;
      console.log(uploadResponse.data.data, "data");

      // Step 2: Save the entity mapping
      const mappingData = {
        Documentid: documentId,
        Entitytypeid: 98, // You may want to make this configurable
        Entityid: JSON.parse(sessionStorage.getItem("userData") || "{}").orgid,
        Documenttypeid: values.selectedDocTypeId,
      };

      const mappingResponse = await CallFor(
        "v2/document/SaveDocEntitiyMapping",
        "POST",
        mappingData,
        "Auth"
      );

      console.log("Mapping Response:", mappingResponse);

      if (mappingResponse) {
        reToast.success("Document uploaded and mapped successfully!");
        router.push("/station/station/document");
      } else {
        reToast.error("Error mapping the document.");
      }
    } catch (error) {
      console.error("Error:", error);
      reToast.error("Error uploading or mapping the document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{
        docName: "",
        selectedDocTypeId: "",
        selectedFileName: "",
        docdesc:"",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSaveBtn}
    >
      {({ setFieldValue }) => (
        <Form className="space-y-4">
          <div className="justify-between flex gap-1 pb-3">
            <div className="text-2xl text-orange-400">Upload DOCUMENT</div>
          </div>

          <div>
            {/* <div className="flex items-center mb-2">
              <label className="w-1/6 font-medium mr-2">Doc Name*</label>
              <Field
                name="docName"
                type="text"
                className="border border-gray-300 px-4 py-2 rounded w-3/4"
                placeholder="Enter document name"
              />
              <ErrorMessage name="docName" component="div" className="text-red-500 ml-2" />
            </div> */}

            <div className="flex flex-col mb-2">
              <div className="flex items-center">
                <label className="w-1/6 font-medium mr-2">Doc Name*</label>
                <Field
                  name="docName"
                  type="text"
                  className="border border-gray-300 px-4 py-2 rounded w-3/4"
                  placeholder="Enter document name"
                />
              </div>
              <div className="ml-[17.66%]">
                <ErrorMessage
                  name="docName"
                  component="div"
                  className="text-red-500 mt-1"
                />
              </div>
            </div>
            <div className="flex flex-col mb-2">
              <div className="flex items-center">
                <label className="w-1/6 font-medium mr-2">Doc Description </label>
                <Field
                  name="docdesc"
                  type="text"
                  className="border border-gray-300 px-4 py-2 rounded w-3/4"
                  placeholder="Enter document Desc"
                />
              </div>
              <div className="ml-[17.66%]">
                <ErrorMessage
                  name="docdesc"
                  component="div"
                  className="text-red-500 mt-1"
                />
              </div>
            </div>

            <div className="flex flex-col mb-2">
              <div className="flex items-center">
                <label className="w-1/6 font-medium mr-2">Doc Type*</label>
                <Field
                  as="select"
                  name="selectedDocTypeId"
                  className="border border-gray-300 px-4 py-2 rounded w-3/4"
                >
                  <option value="">Select Document Type</option>
                  {DocTypeList &&
                    DocTypeList.map((type) => (
                      <option key={type.mvid} value={type.mvid}>
                        {type.mastervalue1}
                      </option>
                    ))}
                </Field>
              </div>
              <div className="ml-[17.66%]">
                <ErrorMessage
                  name="selectedDocTypeId"
                  component="div"
                  className="text-red-500 mt-1"
                />
              </div>
            </div>


            <div className="flex items-center">
              <label className="w-1/6 font-medium mr-2">Upload File*</label>
              <Label className="w-3/4 block">
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.xlsx"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setFieldValue)}
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
              <div className="w-3/4">
                {selectedFileName && (
                  <div className="flex text-gray-600 dark:text-white font-semibold items-center mb-1">
                    <File size={20} className="mr-1" />
                    {selectedFileName}
                    <Trash2
                      size={20}
                      className="ml-1 text-warning cursor-pointer"
                      onClick={() => handleFileDelete(setFieldValue)}
                    />
                  </div>
                )}
                <ErrorMessage
                  name="selectedFileName"
                  component="div"
                  className="text-red-500 mt-1"
                />
              </div>
            </div>

          </div>

          <div className="text-center">
            <Button
              className="text-white bg-blue-950 m-5"
              onClick={() => router.push("/station/station/document")}
            >
              Cancel
            </Button>
            <Button
              className="text-white bg-orange-400"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddDocument;
