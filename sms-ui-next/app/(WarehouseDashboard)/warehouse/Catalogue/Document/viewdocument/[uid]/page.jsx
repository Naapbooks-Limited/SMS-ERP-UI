"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, File, FileUp, Trash2, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import CallFor from "@/utilities/CallFor";
import { toast as reToast } from "react-hot-toast";
import Link from "next/link";
import GlobalPropperties from "@/utilities/GlobalPropperties";

function viewdocument({params}) {
      const router = useRouter();
   const [data, setData] = useState([]);

  const [docName, setDocName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedDocTypeId, setSelectedDocTypeId] = useState("");
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
        // setData(response.data.data || []); // Ensure data is an array
        setData(response.data.data)
        // setSelectedDocTypeId(response.data.data.doctype);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
  
 
 <>
   {/* { data.name && data.name }
   { data.docid && data.docid }
   { data.uploaddate && data.uploaddate }
   { data.format && data.format }
   { data.doctype && data.doctype }
   { data.docurl && data.docurl } */}
       <div className="container mx-auto">
          <div className="flex justify-between">
            <div className="text-2xl text-orange-400">Document</div>
            <Button
              color="warning"
            onClick={() => router.push("/warehouse/Catalogue/Document")}
            >
              <Undo2 size={20} />
              Back
            </Button>
          </div>

          <form className="space-y-4 mt-7">
            <div className="grid grid-cols-2 w-75">
              <div className="flex items-center mb-5">
                <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">DocId</label>
                <p className='text-blue-900 dark:text-white ml-4'> <span className='font-bold'> : </span> <span className="ml-3">{data.docId}</span></p>
              </div>
              <div className="flex items-center mb-5">
                <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">DocName</label>
                <p className='text-blue-900 dark:text-white ml-4'> <span className='font-bold'> : </span><span className="ml-3">{data.name}</span> </p>
              </div>
            <div className="flex items-center mb-5">
              <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">Product</label>
              <p className='text-blue-900 dark:text-white ml-4'> <span className='font-bold'> : </span><span className="ml-3">{data.entityName}</span> </p>
            </div>
              <div className="flex items-center mb-5">
                <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">DocType</label>
                <p className='text-blue-900 dark:text-white ml-4'> <span className='font-bold'> : </span><span className="ml-3">{data.docType}</span> </p>
              </div>
              <div className="flex items-center mb-5">
                <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">Format</label>
                <p className='text-blue-900 dark:text-white ml-4'> <span className='font-bold'> : </span><span className="ml-3">{data.format}</span> </p>
              </div>
              <div className="flex items-center mb-5">
                <label className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white">Uploaded Date</label>
                <p className='text-blue-900 dark:text-white ml-4'> <span className='font-bold'> : </span><span className="ml-3">{data.uploadDate}</span> </p>
              </div>
              <div className="flex items-center space-x-4">
                <label
                  htmlFor="gtin"
                  className="w-1/6 font-bold mr-2 text-blue-900 dark:text-white"
                >
                  DocView
                </label>
                <p className='flex text-blue-900 dark:text-white ml-4'> <span className='font-bold pr-2'> :  </span> <a className="ml-3" href={ GlobalPropperties.viewdocument + `${data.docUrl}`}><Eye size={20} />  </a> </p>
              </div>
         
            </div>
            {/* <div className='mt-7'> */}
            {/* </div> */}
          </form>
        </div>
    </>

    
  )
}

export default viewdocument;