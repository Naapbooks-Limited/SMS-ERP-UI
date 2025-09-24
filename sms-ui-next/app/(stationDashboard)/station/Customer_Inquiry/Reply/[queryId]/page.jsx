"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import CallFor from "@/utilities/CallFor";
import CallFor2 from "@/utilities/CallFor2";
import { useParams } from "next/navigation";
import GlobalPropperties from "@/utilities/GlobalPropperties";
import moment from "moment";
import { useRouter } from 'next/navigation';
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
// Dynamically import React Quill to prevent SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const sharedClasses = {
  userBg: 'bg-blue-500',
  userText: 'text-white',
  adminBg: 'bg-gray-300',
  adminText: 'text-gray-800',
  rounded: 'rounded-lg',
  replyButton: 'bg-green-500 text-white hover:bg-green-400',
  deleteButton: 'bg-red-500 text-white hover:bg-red-400',
};

const ChatMessage = ({ message, sender, timestamp, isUser }) => {
  const now = moment();
  const messageTime = moment(timestamp);
  const diffInDays = now.diff(messageTime, "days");

  const timeDisplay =
    diffInDays < 1
      ? messageTime.fromNow()
      : messageTime.format("DD-MM-YYYY HH:mm");

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } items-center mb-4`}
    >
      {!isUser && (
        <img
          aria-hidden="true"
          alt="admin-avatar"
          src="https://placehold.co/40?text=A"
          className="w-10 h-10 rounded-full mr-2"
        />
      )}
      <div
        className={`${isUser ? sharedClasses.userBg : sharedClasses.adminBg} ${
          isUser ? sharedClasses.userText : sharedClasses.adminText
        } p-4 ${sharedClasses.rounded} max-w-xs shadow-lg`}
      >
        {/* Use dangerouslySetInnerHTML to render the message HTML */}
        <p
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: message }}
        ></p>
        <p className="text-xs text-right mt-2 opacity-70">{timeDisplay}</p>
      </div>
      {isUser && (
        <img
          aria-hidden="true"
          alt="user-avatar"
          src="https://placehold.co/40?text=U"
          className="w-10 h-10 rounded-full ml-2"
        />
      )}
    </div>
  );
};


function ViewInquiry() {
  const [data, setData] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [InquiryDetail, setInquiryDetail] = useState();
  const [showReplyBox, setShowReplyBox] = useState(false);

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const uoid = userData.uid;

  const param = useParams();
  const router = useRouter();
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
  }, []);

  const getInquiryDetail = async () => {
    const response = await CallFor(`v2/Greviance/GetGrevianceDetailsList?Gid=${param.queryId}`, 'GET', null, 'Auth');
    if (response?.status === 200) {
      setData(response.data);
    }
  }

  const handleReplyClick = () => {
    setShowReplyBox(!showReplyBox);
  };

  const handleReplyChange = (value) => {
    if (value !== '') {
      setReplyMessage(value.replace('<p></p>', ""));
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (replyMessage !== '') {
      // Save reply data
      const replyData = {
        gdid: 0,
        gid: param.queryId,
        fromid: uoid,
        gddate: moment().format("YYYY-MM-DDTHH:mm:ss"),
        gdreply: replyMessage.replace('<p>', "").replace('</p>', ""),
        gdattachments: []
      };
      
      try {
        // Save the reply
        const response = await CallFor(`v2/Greviance/SaveGrevianceReplay`, 'POST', JSON.stringify(replyData), 'Auth');
        
        if (response.status === 200) {
          // If reply is saved successfully, send email
          if (data.toemail) {
            const emailUrl = `admin-api/EmailApi/SendEmail?EmailTo=${data.toemail}&subject=${emailSubject}&body=${replyMessage}`;
            
            try {
              await CallFor2(emailUrl, 'POST', null, 'Auth');
              console.log('Email sent successfully');
            } catch (error) {
              console.error('Error sending email:', error);
            }
          }
          
          getInquiryDetail();
          setReplyMessage("");
          setEmailSubject("");
          setShowReplyBox(false);
        }
      } catch (error) {
        console.error('Error saving reply:', error);
      }
    }
  };

  const handleCloseReplyBox = () => {
    setShowReplyBox(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      {/* Grievance Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">{data.grevincetitle}</h2>
        <span
          className={`text-sm font-medium ${data.priority === '0' ? 'text-red-600' : 'text-green-600'}`}
        >
          {data.priority === '0' ? 'High Priority' : 'Normal Priority'}
        </span>
      </div>

      {/* Grievance Description */}
      <p className="text-gray-600">{data.grevincedescription}</p>

      {/* Grievance Metadata */}
      <div className="mt-4">
        <p className="text-gray-500 text-sm">
          Created by: {data.createdbyname} on{' '}
          {new Date(data.gdate).toLocaleDateString()}
        </p>
        <p
          className={`text-sm font-semibold ${data.iscompleted ? 'text-green-600' : 'text-blue-600'}`}
        >
          Status: {data.iscompleted ? 'Resolved' : 'Pending'}
        </p>
      </div>

      {/* Chat Messages */}
      <div className="mt-4">
        {data?.greviancedetails?.map((detail) => (
          <ChatMessage
            key={detail.gdid}
            message={detail.gdreply}
            sender={detail.fromname}
            timestamp={detail.gddate}
            isUser={detail.fromid === uoid}
          />
        ))}
      </div>

      {/* Reply Section */}
      <div className="mt-4">
        <button
          className={`${sharedClasses.replyButton} px-4 py-2 rounded`}
          onClick={handleReplyClick}
        >
          Reply
        </button> 
        
        <button
          className={`bg-red-500 px-4 py-2 mx-2 rounded`}
          onClick={()=>{router.back()}}
        >
          Back
        </button> 

        {showReplyBox && (
          <div className="mt-4 space-y-4">
            {/* Email Subject Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Subject
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email subject..."
              />
            </div>

            {/* Reply Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reply Message
              </label>
              <ReactQuill
                value={replyMessage}
                onChange={handleReplyChange}
                placeholder="Type your reply..."
                className="dark:text-black"
              />
            </div>

            <div className="flex justify-end mt-2">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                onClick={handleCloseReplyBox}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleReplySubmit}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewInquiry;
