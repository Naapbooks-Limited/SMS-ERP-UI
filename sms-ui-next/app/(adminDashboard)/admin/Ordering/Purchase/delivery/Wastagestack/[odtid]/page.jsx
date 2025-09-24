"use client";
import { Button } from "@/components/ui/button";
import CallFor from "@/utilities/CallFor";
import { Undo } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast as reToast } from "react-hot-toast";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  wastageData: Yup.lazy((obj) =>
    Yup.object(
      Object.keys(obj).reduce(
        (acc, key) => ({
          ...acc,
          [key]: Yup.object({
            Wastageqty: Yup.number()
              .typeError("Quantity must be a number")
              .min(0, "Quantity cannot be negative")
              .required("Quantity is required"),
            Wastagetype: Yup.number()
              .typeError("Please select a wastage type")
              .required("Wastage type is required"),
          }),
        }),
        {}
      )
    )
  ),
});

function Wastagestack({ params }) {
  const [deliveryData, setDeliveryData] = useState(null);
  const [wastageData, setWastageData] = useState({});
  const [wastageTypes, setWastageTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const Uoid = userData.orgid;
  const uaid = userData.uaid;
  const router = useRouter();

  useEffect(() => {
    // Fetch delivery data
    CallFor(
      `v2/Orders/GetDeliveryById?odtid=${params.odtid}`,
      "get",
      null,
      "Auth"
    )
      .then((response) => response.data)
      .then((data) => setDeliveryData(data))
      .catch((error) => console.error("Error fetching delivery data:", error));

    // Fetch wastage types
    CallFor("v2/Product/SaveProductwastage", "get", null, "Auth")
      .then((response) => response.data)
      .then((data) => {
        if (data.mastervalues && data.mastervalues.wastageTypes) {
          setWastageTypes(data.mastervalues.wastageTypes.mastervalues);
        }
      })
      .catch((error) => console.error("Error fetching wastage types:", error));
  }, []);

  const validateForm = async () => {
    try {
      await validationSchema.validate({ wastageData }, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationErrors) {
      const newErrors = {};
      validationErrors.inner.forEach((error) => {
        const [_, key, field] = error.path.split(".");
        if (!newErrors[key]) newErrors[key] = {};
        newErrors[key][field] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const saveWastage = async () => {
    const isValid = await validateForm();
    if (!isValid) {
      reToast.error("Please correct the errors before saving");
      return;
    }

    const productWastages = Object.entries(wastageData)
      .filter(([_, data]) => data.Wastageqty >= 0)
      .map(([_, data]) => ({
        wastageid: 0,
        wastageno: null,
        seriesid: null,
        proid: data.Proid,
        pvid: data.Pvid,
        wastageqty: data.Wastageqty,
        wastagevalue: 0,
        wastagedate: new Date().toISOString(),
        uomid: 1,
        uoid: Uoid,
        uaid: uaid,
        dom: deliveryData.odtdate,
        doe: deliveryData.odtdate,
        bcode: "",
        fcode: "",
        remarks: "",
        isapproved: true,
        approvedby: null,
        wastagetype: data.Wastagetype,
        paginationFilter: null,
        prowastageattachments: null,
      }));

    const payload = {
      productWastages: productWastages,
    };

    try {
      const response = await CallFor(
        "v2/Product/SaveProductwastage",
        "post",
        payload,
        "Auth"
      );

      if (response) {
        reToast.success("Wastage stock updated");
        router.push("/admin/Ordering/Purchase/delivery");
      }

      console.log("Wastage saved:", response);
    } catch (error) {
      console.error("Error saving wastage:", error);
      reToast.error("Error updating wastage stock");
    }
  };

  if (!deliveryData || wastageTypes.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-orange-500 text-xl font-semibold p-2">
          WASTAGE STOCK
        </div>
        <Link href="/admin/Ordering/Purchase/delivery">
          <Button color="warning" className="shadow-md">
            <Undo size={20} className="pr-1" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 p-3">
        <div className="pb-3">
          <label className="font-bold inline-block w-32">Warehouse</label>
          <label className="text-orange-300">
            {deliveryData.odtshipperName}
          </label>
        </div>
        <div>
          <label className="font-bold inline-block w-32">PO No</label>
          <label>{deliveryData.orderno}</label>
        </div>
        <div>
          <label className="font-bold inline-block w-32">Total Quantity</label>
          <label>
            {deliveryData.odtitemsmappings.reduce(
              (total, item) => total + item.itemqty,
              0
            )}
          </label>
        </div>
        <div>
          <label className="font-bold inline-block w-32">Delivery Date</label>
          <input
            type="date"
            className="border border-black dark:border-white p-2 bg-transparent"
            defaultValue={deliveryData.odtdate.split("T")[0]}
          />
        </div>
      </div>
      <div>
        <div className="py-8 mt-10 mb-7 max-w-4xl">
          <table className="border-black dark:border-white">
            <thead>
              <tr>
                <th className="py-3 px-6 text-center">Sr. No</th>
                <th className="py-3 px-6 text-center">Select Product</th>
                <th className="py-3 px-6 text-center">Attributes</th>
                <th className="py-3 px-6 text-center">Quantity in Delivery</th>
                <th className="py-3 px-6 text-center">Wasted Quantity</th>
                <th className="py-3 px-6 text-center">Wastage Type</th>
              </tr>
            </thead>
            <tbody>
              {deliveryData.odtitemsmappings.map((item, index) => (
                <tr key={item.odtimid}>
                  <td className="py-3 px-6 text-center">{index + 1}</td>
                  <td className="py-3 px-6 text-center">{item.productname}</td>
                  <td className="py-3 px-6 text-center">
                    {item.oitems.orderitemdetails
                      .map(
                        (detail) =>
                          `  ${detail.attributename}: ${detail.attrvalue}`
                      )
                      .join(", ")}
                  </td>
                  <td className="py-3 px-6 text-center">{item.deliveredqty}</td>
                  <td className="py-3 px-6 text-center">
                    <input
                      type="number"
                      className="text-center w-20 bg-transparent border border-black dark:border-white rounded-sm"
                      value={wastageData[item.odtimid]?.Wastageqty ?? ""}
                      onChange={(e) => {
                        const newValue =
                          e.target.value === ""
                            ? ""
                            : Math.max(0, parseFloat(e.target.value) || 0);
                        const newWastageData = { ...wastageData };
                        newWastageData[item.odtimid] = {
                          ...newWastageData[item.odtimid],
                          Wastageqty: newValue,
                          Proid: item.oitems.proid,
                          Pvid: item.oitems.pvid,
                        };
                        setWastageData(newWastageData);
                      }}
                      min="0"
                      step="any"
                    />
                    {errors[item.odtimid]?.Wastageqty && (
                      <div className="text-red-500 text-xs">
                        {errors[item.odtimid].Wastageqty}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <select
                      className="bg-transparent border border-black dark:border-white rounded-sm"
                      value={wastageData[item.odtimid]?.Wastagetype || ""}
                      onChange={(e) => {
                        const newWastageData = { ...wastageData };
                        newWastageData[item.odtimid] = {
                          ...newWastageData[item.odtimid],
                          Wastagetype: parseInt(e.target.value),
                        };
                        setWastageData(newWastageData);
                      }}
                    >
                      <option value="">Select Type</option>
                      {wastageTypes.map((type) => (
                        <option key={type.mvid} value={type.mvid}>
                          {type.mastervalue1}
                        </option>
                      ))}
                    </select>
                    {errors[item.odtimid]?.Wastagetype && (
                      <div className="text-red-500 text-xs">
                        {errors[item.odtimid].Wastagetype}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <div>
            <Link href="/admin/Ordering/Purchase/delivery">
              <Button className="text-white bg-[#11375C]">Cancel</Button>
            </Link>
            <Button
              color="warning"
              className="text-white ml-2"
              onClick={saveWastage}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Wastagestack;
