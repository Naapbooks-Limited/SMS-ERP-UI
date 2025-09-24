"use client";
import { Button } from "@/components/ui/button";
import { Undo } from "lucide-react";
import Link from "next/link";
import React, { useState ,useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import CallFor from "@/utilities/CallFor";
import { useParams } from "next/navigation";
import GlobalPropperties from "@/utilities/GlobalPropperties";

// Dynamically import React Quill to prevent SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

function ViewInquiry() {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");

  const [InquiryDetail, setInquiryDetail] = useState();

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const uoid = userData.uid;

  const param = useParams();
  const date = new Date();

  const UrlType = {
    TEST: 'TEST',
    LIVE: 'LIVE',
    LOCAL: 'LOCAL'
  };
  let url = '';
  if (GlobalPropperties.environment === UrlType.LIVE) {
    url = GlobalPropperties.urlParam.replace("api", "")
  } else if (GlobalPropperties.environment === UrlType.TEST) {
    url = GlobalPropperties.testParam
  } else {
    url = GlobalPropperties.localUrlParam.replace("api", "")
  }

  useEffect(() => {
    getInquiryDetail();
  }, [])

  const getInquiryDetail = async () => {
    const response = await CallFor(`v2/Greviance/GetGrevianceDetailsList?Gid=${param.queryId}`, 'GET', null, 'Auth');
    if (response?.status === 200) {
      setInquiryDetail(response.data)
    }
  }

  const convertDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleReplyClick = () => {
    setShowReplyBox(!showReplyBox);
  };

  const handleReplyChange = (value) => {
    if (value !== '') {
      setReplyMessage(value.replace('<p></p>',""));
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
   if (replyMessage !== '') {
     const data = {
       gdid: 0,
       gid: param.queryId,
       fromid: uoid,
       gddate: date.toISOString(),
       gdreply: replyMessage.replace('<p>',"").replace('</p>',""),
       gdattachments: [
         // {
         //   "gdaid": 0,
         //   "gdid": 0,
         //   "gid": 0,
         //   "attachment": "string"
         // }
       ]
     }
     const response = await CallFor(`v2/Greviance/SaveGrevianceReplay`, 'POST', JSON.stringify(data), 'Auth');
     if (response.status === 200) {
      getInquiryDetail();
     }
     // Optionally, clear the reply box after submission
     setReplyMessage("");
     setShowReplyBox(false);
   }
  };

  const handleCloseReplyBox = () => {
    setShowReplyBox(false);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between">
          <div className="text-2xl text-orange-400">
            Query
          </div>
          <Link href={"/admin/Customer_Inquiry"}>
            <Button color="warning">
              <Undo size={20} />
              Back
            </Button>
          </Link>
        </div>
      {/* Original inquiry */}
      <div className="bg-gray-100 p-4 rounded-lg max-w-[80%] self-start">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{InquiryDetail?.createdbyname}</span>
          <span>{convertDate(InquiryDetail?.gdate)}</span>
        </div>
        <div>
          <h3 className="font-semibold mb-2">{InquiryDetail?.grevincetitle}</h3>
          <p className="text-gray-800">{InquiryDetail?.grevincedescription}</p>
          {InquiryDetail?.gdattachments?.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold">Attachments:</p>
              <div className="flex space-x-2 mt-1">
                {InquiryDetail.gdattachments.map((item, index) => (
                  <img
                    key={index}
                    src={url + item.attachment}
                    alt={`Attachment ${index + 1}`}
                    className="w-12 h-12 object-cover border border-gray-300"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {InquiryDetail?.greviancedetails?.map((item, index) => (
        <div key={index} className="bg-blue-100 p-4 rounded-lg max-w-[80%] self-end">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{item.fromname}</span>
            <span>{convertDate(item.gddate)}</span>
          </div>
          <div
            className="text-gray-800"
            dangerouslySetInnerHTML={{ __html: item.gdreply }}
          />
        </div>
      ))}
    </div>
  );
}

export default ViewInquiry;
