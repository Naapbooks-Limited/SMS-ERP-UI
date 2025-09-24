"use client"
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import CallFor2 from '@/utilities/CallFor2';
import { toast as reToast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Define Yup validation schema
// Define Yup validation schema

// Define Yup validation schema
const schema = yup.object().shape({
  Name: yup.string().required("Name is required"),
  AdminComment: yup.string().required("Admin Comment is required"),
  StartDateUtc: yup
    .date()
    .required("Start Date is required")
    .typeError("Invalid date format"),
  EndDateUtc: yup
    .date()
    .required("End Date is required")
    .typeError("Invalid date format")
    .min(yup.ref("StartDateUtc"), "End date must be after start date"),

  // Conditional validations
  UsePercentage: yup.boolean(),
  DiscountAmount: yup.number().when("UsePercentage", {
    is: false,
    then: schema => schema
      .required("Discount Amount is required")
      .positive("Discount must be greater than 0"),
    otherwise: schema => schema.notRequired(),
  }),
  DiscountPercentage: yup.number().when("UsePercentage", {
    is: true,
    then: schema => schema
      .required("Discount Percentage is required")
      .min(0.01, "Discount % must be greater than 0")
      .max(100, "Discount % cannot exceed 100"),
    otherwise: schema => schema.notRequired(),
  }),
  MaximumDiscountAmount: yup.number().when("UsePercentage", {
    is: true,
    then: schema => schema
      .required("Maximum Discount Amount is required")
      .positive("Maximum Discount must be greater than 0"),
    otherwise: schema => schema.notRequired(),
  }),

  // Limitation validation
  DiscountLimitationId: yup.string().required("Please select a limitation"),
  LimitationTimes: yup.number().when("DiscountLimitationId", {
    is: (val) => val === "15" || val === "25",
    then: schema => schema
      .required("Limitation Times is required")
      .positive("Must be greater than 0"),
    otherwise: schema => schema.notRequired(),
  }),

  // Coupon validation
  RequiresCouponCode: yup.boolean(),
  CouponCode: yup.string().when("RequiresCouponCode", {
    is: true,
    then: schema => schema.required("Coupon Code is required"),
    otherwise: schema => schema.notRequired(),
  }),

  // Active flag
  IsActive: yup.boolean().required("Status is required"),
});


function AddOfferDiscount() {
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      UsePercentage: false,
      RequiresCouponCode: false,
      IsActive: true,
      DiscountLimitationId: 0,
    }
  });
  const discountLimitationId = watch('DiscountLimitationId');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const usePercentage = watch('UsePercentage');
  const requiresCouponCode = watch('RequiresCouponCode');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await CallFor2('Discount/admin-api/Create', "get", null, "Auth");
        const data = response.data;
        Object.keys(data).forEach(key => {
          setValue(key, data[key]);
        });
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await CallFor2('Discount/admin-api/Create', "post", {
        ...data,
        DiscountTypeId: 2,
        DiscountTypeName: "Assigned to Products" // Always passed as 2
      }, "Auth");
      if (response) {
        reToast.success("User saved successfully!");
        router.push("/station/portals/offerDiscount");
      } else {
        reToast.error("Error saving user.");
      }

    } catch (error) {
      console.error('Error creating discount:', error);
      // Handle error (e.g., show error message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto p-6 bg-white dark:bg-black rounded-md shadow-md">
        <div className='flex justify-between items-center mb-6'>
          <div className='text-orange-500 text-2xl bold '>Add OFFERS & DISCOUNTS</div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-4">
            <label htmlFor="Name" className="w-1/4 font-medium dark:text-white text-gray-700">Name</label>
            <input
              {...register('Name')}
              type="text"
              className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.Name && <p className="text-red-500">{errors.Name.message}</p>}
          </div>
          <div className="flex items-center space-x-4">
            <label htmlFor="AdminComment" className="w-1/4 font-medium dark:text-white text-gray-700">Admin Comment</label>
            <input
              {...register('AdminComment')}
              type="text"
              className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.AdminComment && <p className="text-red-500">{errors.AdminComment.message}</p>}
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 font-medium dark:text-white text-gray-700">Use percentage</label>
            <Controller
              name="UsePercentage"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  {...field}
                  checked={field.value}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>
          {!usePercentage && (
            <div className="flex items-center space-x-4">
              <label htmlFor="DiscountAmount" className="w-1/4 font-medium dark:text-white text-gray-700">Discount Amount</label>
              <input
                {...register('DiscountAmount')}
                type="number"
                step="0.01"
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.DiscountAmount && <p className="text-red-500">{errors.DiscountAmount.message}</p>}
            </div>
          )}
          {usePercentage && (
            <>
              <div className="flex items-center space-x-4">
                <label htmlFor="DiscountPercentage" className="w-1/4 font-medium dark:text-white text-gray-700">Discount Percentage</label>
                <input
                  {...register('DiscountPercentage')}
                  type="number"
                  step="0.01"
                  className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.DiscountPercentage && <p className="text-red-500">{errors.DiscountPercentage.message}</p>}
              </div>
              <div className="flex items-center space-x-4">
                <label htmlFor="MaximumDiscountAmount" className="w-1/4 font-medium dark:text-white text-gray-700">Maximum Discount Amount</label>
                <input
                  {...register('MaximumDiscountAmount')}
                  type="number"
                  step="0.01"
                  className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.MaximumDiscountAmount && <p className="text-red-500">{errors.MaximumDiscountAmount.message}</p>}
              </div>
            </>
          )}
          <div className="flex items-center space-x-4">
            <label htmlFor="StartDateUtc" className="w-1/4 font-medium dark:text-white text-gray-700">Start Date</label>
            <input
              {...register('StartDateUtc')}
              type="datetime-local"
              className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.StartDateUtc && <p className="text-red-500">{errors.StartDateUtc.message}</p>}
          </div>
          <div className="flex items-center space-x-4">
            <label htmlFor="EndDateUtc" className="w-1/4 font-medium dark:text-white text-gray-700">End Date</label>
            <input
              {...register('EndDateUtc')}
              type="datetime-local"
              className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.EndDateUtc && <p className="text-red-500">{errors.EndDateUtc.message}</p>}
          </div>
          <div className="flex items-center space-x-4">
            <label htmlFor="DiscountLimitationId" className="w-1/4 font-medium dark:text-white text-gray-700">Discount Limitation</label>
            <select
              {...register('DiscountLimitationId')}
              className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">No limitation</option>
              <option value="15">N times only</option>
              <option value="25">N times per customer</option>
            </select>
            {errors.DiscountLimitationId && <p className="text-red-500">{errors.DiscountLimitationId.message}</p>}
          </div>

          {(discountLimitationId == "15" || discountLimitationId == "25") && (
            <div className="flex items-center space-x-4">
              <label htmlFor="LimitationTimes" className="w-1/4 font-medium dark:text-white text-gray-700">N Times</label>
              <input
                {...register('LimitationTimes')}
                type="number"
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.LimitationTimes && <p className="text-red-500">{errors.LimitationTimes.message}</p>}
            </div>
          )}
          <div className="flex items-center space-x-4">
            <label htmlFor="IsActive" className="w-1/4 font-medium dark:text-white text-gray-700">Is Active</label>
            <Controller
              name="IsActive"
              control={control}
              render={({ field }) => (
                <Switch {...field} checked={field.value} />
              )}
            />
            {errors.IsActive && <p className="text-red-500">{errors.IsActive.message}</p>}
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 font-medium dark:text-white text-gray-700">Requires Coupon Code</label>
            <Controller
              name="RequiresCouponCode"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  {...field}
                  checked={field.value}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
            {errors.RequiresCouponCode && <p className="text-red-500">{errors.RequiresCouponCode.message}</p>}
          </div>
          {requiresCouponCode && (
            <div className="flex items-center space-x-4">
              <label htmlFor="CouponCode" className="w-1/4 font-medium dark:text-white text-gray-700">Coupon Code</label>
              <input
                {...register('CouponCode')}
                type="text"
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.CouponCode && <p className="text-red-500">{errors.CouponCode.message}</p>}
            </div>
          )}
        </div>

        <div className='bg-white dark:bg-black mt-5 p-3' style={{ boxShadow: "5px 5px 5px gray "}}>

        <div className='flex justify-between item-center font-semibold' >
          <div className='pt-3 text-1xl'>Requirements
          </div>
            <Plus size={20} className="" />
        </div>

          <div className='py-3 pl-2 mt-3 text-1xl'>You need to save the discount before you can add requirements for this discount page.
          </div>
        </div>

        <div className='flex justify-end mt-6'>
          <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            {loading ? 'Saving...' : 'Save'}
          </Button>
          <Link href="/station/portals/offerDiscount" passHref>
            <Button className="bg-gray-500 ms-2 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AddOfferDiscount;


