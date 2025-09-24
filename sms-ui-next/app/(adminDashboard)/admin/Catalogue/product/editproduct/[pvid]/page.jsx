"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, X, Upload } from "lucide-react";
import Link from "next/link";
import Select from 'react-select';
import CallFor from "@/utilities/CallFor";
import CallFor2 from "@/utilities/CallFor2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { usePathname } from 'next/navigation';
import { toast as reToast } from "react-hot-toast";
import { useRouter } from 'next/navigation';
const EditProductForm = ({params}) => {

  const pathname = usePathname();
  // const [attributes, setAttributes] = useState([]);
  const [skuOptions, setSkuOptions] = useState([]);
  const router = useRouter()

  const [isRelatedProductsModalOpen, setIsRelatedProductsModalOpen] = useState(false);
  // const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  // const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  // Add this state to track deleted image IDs
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  // const fileInputRef = useRef(null);
  // const [formData, setFormData] = useState({
  //   pvamappings: []
  // });



  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const Uid = userData.uid;
  const orgid = userData.orgid
  const [formData, setFormData] = useState({
    pvid: 0,
    proid: 0,
    pvname: "",
    pvdesc: "",
    shortdesc: "",
    pvbarcode: "",
    pvsku: "",
    pvdefaultimgid: 537,
    pvstatus: 0,
    pvcurrencyid: null,
    pvsalesprice: "",
    pvpurchaseprice: "",
    pvoldprice: "",
    pvspecialprice: "",
    pvspstartdate: "",
    pvspenddate: "",
    orgid: orgid,
    warehouseid: 70,
    autorenew: false,
    safetylevel: 10,
    reorderlevel: 20,
    availabledate: "",
    enddate: "",
    openingstock: "",
    openingstockdate: "",
    closingstock: "",
    closingstockdate: "",
    isinclusive: false,
    moq: 5,
    isPublished: false,
    markAsNew: false,
    markAsNewStartDateTimeUtc: "",
    markAsNewEndDateTimeUtc: "",
    isdeleted: false,
    proid: null,
    provarianttaxes: [{
      protaxid: 0,
      isexempt: false, // Set a default value
      effectivedate: null,
      taxrate: null,
      hsncode: null,
      proid: null,
      pvid: null
    }],
    pvamappings: [{
      pvamid: 0,
      proid: null,
      pvid: null,
      attributeid: null,
      attributeName: null,
      attrtextprompt: null,
      isrequired: false, // Set a default value
      controltype: null,
      displayorder: null,
      pvamvaluemodels: [{
        pvamvid: 0,
        pvamid: null,
        avid: null,
        pvamvcolor: null,
        umid: null,
        attributeValueName: null,
        displayorder: null
      }]
    }],
    pvummappings: [{
      pvumid: 0,
      proid: null,
      pvid: null,
      productimgid: null
    }],
    relatedproducts: [],
    pictureNopIds: [],
  });

  const fetchProductData = async () => {
    try {
      const response = await CallFor(`v2/Product/GetProductVariantByPvId?PvId=${params.pvid}`, "get", null, "Auth");
      const productData = response.data.data;
      
      // Set uploaded images from pvummappings
      if (productData.pvummappings) {
        const images = productData.pvummappings.map(mapping => ({
          id: mapping.productimgid,
          preview: `${process.env.NEXT_PUBLIC_VIEW_DOCUMENT}/${mapping.productimg.umurl}`,
          name: mapping.productimg.umname
        }));
        setUploadedImages(images);
      }

      setFormData(prevData => ({
        ...prevData,
        ...productData,
        // ... rest of your formData mapping
      }));

      // Set related products and attributes
      setSelectedAttributes(productData.pvamappings.map(mapping => ({
        name: mapping.attributeid,
        value: mapping.pvamvalues[0]?.avid
      })));
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [params.pvid]);


  // useEffect(() => {
  //   const handleRouteChange = () => {
  //     console.log("pathname", pathname);
  //     const validRoutes = [
  //       '/station/Catalogue/Products/productadd',
  //       '/station/Catalogue/Products/addnewattribute'
  //     ];

  //     console.log("route", validRoutes.includes(pathname));

  //     if (!validRoutes.includes(pathname)) {
  //       // Clear session storage and form data
  //       sessionStorage.removeItem('productFormData');
  //       sessionStorage.removeItem('imagePreview');
  //       setFormData({
  //         pvid: 0,
  //         proid: 0,
  //         pvname: "",
  //         pvdesc: "",
  //         shortdesc: "",
  //         pvbarcode: "",
  //         pvsku: "",
  //         pvdefaultimgid: 537,
  //         pvstatus: 0,
  //         pvcurrencyid: 1,
  //         pvsalesprice: "",
  //         pvpurchaseprice: "",
  //         pvoldprice: "",
  //         pvspecialprice: "",
  //         pvspstartdate: "",
  //         pvspenddate: "",
  //         orgid: orgid,
  //         warehouseid: 70,
  //         autorenew: false,
  //         safetylevel: 10,
  //         reorderlevel: 20,
  //         availabledate: "",
  //         enddate: "",
  //         openingstock: "",
  //         openingstockdate: "",
  //         closingstock: "",
  //         closingstockdate: "",
  //         isinclusive: false,
  //         moq: 5,
  //         isPublished: false,
  //         markAsNew: false,
  //         markAsNewStartDateTimeUtc: "",
  //         markAsNewEndDateTimeUtc: "",
  //         isdeleted: false,
  //         proid: null,
  //         provarianttaxes: [{
  //           protaxid: 0,
  //           isexempt: false, // Set a default value
  //           effectivedate: null,
  //           taxrate: null,
  //           hsncode: null,
  //           proid: null,
  //           pvid: null
  //         }],
  //         pvamappings: [{
  //           pvamid: 0,
  //           proid: null,
  //           pvid: null,
  //           attributeid: null,
  //           attributeName: null,
  //           attrtextprompt: null,
  //           isrequired: false, // Set a default value
  //           controltype: null,
  //           displayorder: null,
  //           pvamvaluemodels: [{
  //             pvamvid: 0,
  //             pvamid: null,
  //             avid: null,
  //             pvamvcolor: null,
  //             umid: null,
  //             attributeValueName: null,
  //             displayorder: null
  //           }]
  //         }],
  //         pvummappings: [{
  //           pvumid: 0,
  //           proid: null,
  //           pvid: null,
  //           productimgid: null
  //         }],
  //         relatedProducts: [],
  //         relatedProducts: []
  //       });
  //       setImagePreview(null);
  //     }
  //   };

  //   handleRouteChange();

  //   // Load saved data when component mounts
  //   const savedFormData = sessionStorage.getItem('productFormData');
  //   if (savedFormData) {
  //     setFormData(JSON.parse(savedFormData));
  //   }
  //   const savedImagePreview = sessionStorage.getItem('imagePreview');
  //   if (savedImagePreview) {
  //     setImagePreview(savedImagePreview);
  //   }
  // }, [pathname]);



  ////
  // const saveFormDataToSessionStorage = (data) => {
  //   sessionStorage.setItem('productFormData', JSON.stringify(data));
  // };

  // useEffect(() => {
  //   const savedFormData = sessionStorage.getItem('productFormData');
  //   if (savedFormData) {
  //     setFormData(JSON.parse(savedFormData));
  //   }
  //   const savedImagePreview = sessionStorage.getItem('imagePreview');
  //   if (savedImagePreview) {
  //     setImagePreview(savedImagePreview);
  //   }
  // }, []);

  

  const RelatedProductsModal = () => (
    <Dialog open={isRelatedProductsModalOpen} onOpenChange={setIsRelatedProductsModalOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <Plus size={16} className="mr-2" /> Add Related Products
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Related Products</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {skuOptions.map((product) => (
            <div key={product.value} className="flex items-center space-x-2">
              <Checkbox
                id={`product-${product.value}`}
                checked={formData.relatedproducts.some(p => p.relatedproid === product.value)}
                onCheckedChange={(checked) => handleRelatedProductChange(product.value, checked)}
              />
              <label
                htmlFor={`product-${product.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {product.label}
              </label>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  const handleImageUpload = async () => {
    if (!imageFiles.length) return;

    try {
      // First upload each image to Account/UploadPicture API and collect IDs
      const pictureIds = [];
      for (const file of imageFiles) {
        const pictureFormData = new FormData();
        pictureFormData.append('picturefile', file);

        const pictureResponse = await CallFor2(
          'api-fe/Account/UploadPicture',
          'post',
          pictureFormData,
          'authWithContentTypeMultipart'
        );

        if (pictureResponse.data?.Data?.PictureId) {
          pictureIds.push(pictureResponse.data.Data.PictureId);
        }
      }

      // Now upload to Product API
      const productFormData = new FormData();
      
      // Append each image file with its metadata
      imageFiles.forEach((file, index) => {
        productFormData.append(`productImgModelList[${index}].Umurl`, file);
        productFormData.append(`productImgModelList[${index}].Uid`, Uid);
        productFormData.append(`productImgModelList[${index}].Umid`, "0");
        productFormData.append(`productImgModelList[${index}].Umname`, file.name);
        productFormData.append(`productImgModelList[${index}].Umalttext`, file.name);
        productFormData.append(`productImgModelList[${index}].Umsizes`, "0");
        productFormData.append(`productImgModelList[${index}].Umbytes`, "0");
        productFormData.append(`productImgModelList[${index}].Umtype`, "2");
      });

      // Append the collected picture IDs
      pictureIds.forEach((id) => {
        productFormData.append('pictureNopIds[]', id);
      });

      const response = await CallFor(
        "v2/Product/SaveMultipleProductImages",
        "post",
        productFormData,
        "authWithContentTypeMultipart"
      );

      // Update formData with the uploaded images and picture IDs
      setFormData(prevData => ({
        ...prevData,
        pvdefaultimgid: response.data.data[0].productimgid, // Set first image as default
        pictureNopIds: [...(prevData.pictureNopIds || []), ...pictureIds], // Store the picture IDs
        pvummappings: [
          ...prevData.pvummappings,
          ...response.data.data.map(img => ({
            pvumid: img.pvumid,
            proid: prevData.proid,
            pvid: prevData.pvid || 0,
            productimgid: img.productimgid
          }))
        ]
      }));

      // Update the uploadedImages state for UI display
      const newImages = response.data.data.map(img => ({
        id: img.productimgid,
        preview: URL.createObjectURL(imageFiles[0]), // Create preview URL for new images
        name: imageFiles[0].name
      }));
      setUploadedImages(prev => [...prev, ...newImages]);

      // Clear the file input and previews
      setImageFiles([]);
      setImagePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      reToast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading images:", error);
      reToast.error("Failed to upload images");
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setImageFiles(files);
      
      // Create previews for all selected files
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleRelatedProductChange = (productId, isChecked) => {
    setFormData(prevData => {
      const newData = {
        ...prevData,
        relatedproducts: isChecked
          ? [...prevData.relatedproducts, { ppmid: 0, pvid: 0, relatedproid: productId }]
          : prevData.relatedproducts.filter(product => product.relatedproid !== productId)
      };
      // saveFormDataToSessionStorage(newData);
      return newData;
    });
  };

  const handleSkuChange = (selectedOption) => {
    setFormData(prevData => ({
      ...prevData,
      proid: selectedOption.value,
      pvsku: selectedOption.value,
      provarianttaxes: [{
        ...prevData.provarianttaxes[0],
        proid: selectedOption.value
      }],
      pvamappings: prevData.pvamappings.map(mapping => ({
        ...mapping,
        proid: selectedOption.value
      })),
      pvummappings: prevData.pvummappings.map(mapping => ({
        ...mapping,
        proid: selectedOption.value
      }))
    }));
  };
  useEffect(() => {
    // Fetch attributes, SKUs, and currency options from your API
    const fetchOptions = async () => {
      try {
        const response = await CallFor("v2/Product/SaveProductvariant", "get", null, "Auth");
        const data = await response.data;
        setSkuOptions(data.dropdowns.products.map(product => ({ value: product.id, label: product.proname })));
        setCurrencyOptions(data.dropdowns.currency.map(curr => ({ value: curr.id, label: curr.name })));
        setAttributes(data.dropdowns.attributes.map(attr => ({
          id: attr.id,
          name: attr.name,
          values: attr.subdata.map(sub => ({ value: sub.id, label: sub.name }))
        })));
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value
    };
    setFormData(newFormData);
    // saveFormDataToSessionStorage(newFormData);
  };

  const [selectedAttributes, setSelectedAttributes] = useState([{ name: null, value: null }]);

  const handleAddAttribute = () => {
    setSelectedAttributes([...selectedAttributes, { name: null, value: null }]);
  };

  const handleRemoveAttribute = (index) => {
    if (selectedAttributes.length > 1) {
      const newAttributes = [...selectedAttributes];
      newAttributes.splice(index, 1);
      setSelectedAttributes(newAttributes);

      // Remove from formData as well
      const newPvamappings = formData.pvamappings.filter((_, i) => i !== index);
      setFormData(prevData => ({
        ...prevData,
        pvamappings: newPvamappings
      }));
    }
  };
  const handleAttributeChange = (index, type, value) => {
    const newAttributes = [...selectedAttributes];
    newAttributes[index][type] = value;
    setSelectedAttributes(newAttributes);

    setFormData(prevData => {
      const newPvamappings = [...prevData.pvamappings];
      if (type === 'name') {
        newPvamappings[index] = {
          pvamid: 0,
          proid: prevData.proid,
          pvid: null,
          attributeid: value,
          attributeName: attributes.find(attr => attr.id === value)?.name,
          attrtextprompt: null,
          isrequired: false, // Set a default value
          controltype: null,
          displayorder: null,
          pvamvaluemodels: []
        };
      } else if (type === 'value') {
        const attributeValue = attributes
          .find(attr => attr.id === newAttributes[index].name)?.values
          .find(val => val.value === value);

        newPvamappings[index] = {
          ...newPvamappings[index],
          pvamvaluemodels: [{
            pvamvid: 0,
            pvamid: null,
            avid: value,
            pvamvcolor: null,
            umid: null,
            attributeValueName: attributeValue?.label,
            displayorder: null
          }]
        };
      }
      return {
        ...prevData,
        pvamappings: newPvamappings
      };
    });
  };
  const handleCurrencyChange = (selectedOption) => {
    setFormData(prevData => ({
      ...prevData,
      pvcurrencyid: selectedOption.value
    }));
  };



// Modify the handleSubmit function to exclude deleted images
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (!formData.pvdefaultimgid) {
      reToast.error("Please upload an image for the product.");
      return;
    }

    // Create a copy of formData to send
    const dataToSend = {
      ...formData,
      pictureNopIds: formData.pictureNopIds || [], // Make sure pictureNopIds is included
      deletedImageIds: deletedImageIds // Include deleted image IDs if any
    };

    const response = await CallFor(
      "v2/Product/UpdateProductVariant",
      "post",
      JSON.stringify(dataToSend),
      "Auth"
    );

    if (response.data) {
      reToast.success("Product updated successfully!");
      router.push("/admin/Catalogue/product");
    }
  } catch (error) {
    console.error("Error:", error);
    reToast.error("Failed to update product");
  }
};
  

  // Modify the handleRemoveImage function
  const handleRemoveImage = async (imageId) => {
    try {
      // Add the deleted image ID to the tracking array
      setDeletedImageIds(prevIds => [...prevIds, imageId]);
      
      // Remove the image from UI
      setUploadedImages(prevImages => prevImages.filter(img => img.id !== imageId));
      
      // Update the formData to exclude the deleted image from pvummappings
      setFormData(prevData => ({
        ...prevData,
        pvummappings: prevData.pvummappings.filter(
          mapping => mapping.productimgid !== imageId
        )
      }));
    } catch (error) {
      console.error("Error removing image:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="dark:text-white p-6 rounded-lg shadow-md space-y-4">
          {/* <h2 className="text-2xl font-bold text-orange-500 mb-4">Product Variant</h2> */}
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold text-orange-500 mb-4">Product</h2>
            {/* <Link href="/station/Catalogue/Products/skurequest">
              <Button color="warning" className="shadow-md">
                <Plus size={20} className="pr-1" />
                Request SKU
              </Button>
            </Link> */}
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium">Product Name</label>
            <input
              type="text"
              name="pvname"
              value={formData.pvname}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium">Description</label>
            <textarea
              name="pvdesc"
              value={formData.pvdesc}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium">Short Description</label>
            <input
              type="text"
              name="shortdesc"
              value={formData.shortdesc}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium">Barcode</label>
            <input
              type="text"
              name="pvbarcode"
              value={formData.pvbarcode}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium">SKU</label>
            <Select
              options={skuOptions}
              value={skuOptions.find(option => option.value === formData.proid)}
              onChange={handleSkuChange}
              className="w-3/4 mt-1 block text-black"
            />
          </div>


          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Published</label>
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Show on home page
            </label>
            <input
              type="checkbox"
              name="displayOnHomePage"
              checked={formData.displayOnHomePage}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Available start date
            </label>
            <input
              type="datetime-local"
              name="availabledate"
              value={formData.availabledate}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Available end date
            </label>
            <input
              type="datetime-local"
              name="enddate"
              value={formData.enddate}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Auto Renew</label>
            <input
              type="checkbox"
              name="autorenew"
              checked={formData.autorenew}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Mark as new</label>
            <input
              type="checkbox"
              name="markAsNew"
              checked={formData.markAsNew}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Mark as New start date
            </label>
            <input
              type="datetime-local"
              name="markAsNewStartDateTimeUtc"
              value={formData.markAsNewStartDateTimeUtc}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Mark as New end date
            </label>
            <input
              type="datetime-local"
              name="markAsNewEndDateTimeUtc"
              value={formData.markAsNewEndDateTimeUtc}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium">Currency</label>
            <Select
              options={currencyOptions}
              value={currencyOptions.find(option => option.value === formData.pvcurrencyid)}
              onChange={handleCurrencyChange}
              className="w-3/4 mt-1 block text-black"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium">Sales Price</label>
            <input
              type="number"
              name="pvsalesprice"
              value={formData.pvsalesprice}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Admin comment</label>
            <textarea
              name="adminComment"
              value={formData.adminComment}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="This is a test comment"
            />
          </div>
        </div>

        <div className="dark:text-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-2xl font-bold text-orange-500 mb-4">Pricing</h2>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Price</label>
            <input
              type="number"
              name="pvsalesprice"
              value={formData.pvsalesprice}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="1"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Purchase price</label>
            <input
              type="number"
              name="pvpurchaseprice"
              value={formData.pvpurchaseprice}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="1"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Old price</label>
            <input
              type="number"
              name="pvoldprice"
              value={formData.pvoldprice}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="1"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Special price</label>
            <input
              type="number"
              name="pvspecialprice"
              value={formData.pvspecialprice}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="1"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Special start date
            </label>
            <input
              type="datetime-local"
              name="pvspstartdate"
              value={formData.pvspstartdate}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Special end date
            </label>
            <input
              type="datetime-local"
              name="pvspenddate"
              value={formData.pvspenddate}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Product cost</label>
            <input
              type="number"
              name="pvpurcheseprice"
              value={formData.pvpurcheseprice}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="1"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Disable wishlist button
            </label>
            <input
              type="checkbox"
              name="disableWishlistButton"
              checked={formData.disableWishlistButton}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Tax exempt
            </label>
            <input
              type="checkbox"
              name="taxExempt"
              checked={formData.taxExempt}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Tax category
            </label>
            <input
              type="text"
              name="taxCategory"
              checked={formData.taxCategory}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"

            />
          </div>
          <div className="border-b-2 pb-2">Tier prices</div>
          <div>
            You need to save the product before you can add tier prices for this
            product page.
          </div>

        </div>
        <div className="dark:text-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-2xl font-bold text-orange-500 mb-4">
            Inventory
          </h2>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Inventory Method</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="This is a test sku"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Opening Stock Quantity</label>
            <input
              type="number"
              name="openingstock"
              value={formData.openingstock}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="1"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Opening Stock Date
            </label>
            <input
              type="datetime-local"
              name="openingstockdate"
              value={formData?.openingstockdate}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Closing Stock Quantity
            </label>
            <input
              type="number"
              name="closingstock"
              value={formData?.closingstock}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="1"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Closing Stock Date
            </label>
            <input
              type="datetime-local"
              name="closingstockdate"
              value={formData?.closingstockdate}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Allowed Quantities</label>
            <select
              name="backorderMode"
              value={formData.backorderMode}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            >
              <option>1</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Not returnable</label>
            <input
              type="checkbox"
              name="allowBackInStockSubscriptions"
              checked={formData.allowBackInStockSubscriptions}
              onChange={handleChange}
            />
          </div>


        </div>

        {/* <div className="dark:text-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-2xl font-bold text-orange-500 mb-4">Shipping</h2>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Product availability range
            </label>
            <select
              name="productAvailabilityRange"
              value={formData.productAvailabilityRange}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            >
              <option>1</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">
              Is free shipping
            </label>
            <input
              type="checkbox"
              name="isFreeShipping"
              checked={formData.isFreeShipping}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Ship separately</label>
            <input
              type="checkbox"
              name="shipSeparately"
              checked={formData.shipSeparately}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Additional shipping charge</label>
            <input
              type="number"
              name="additionalShippingCharge"
              value={formData.additionalShippingCharge}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="1"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Delivery date</label>
            <select
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            >
              <option>1</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Pickup in store</label>
            <input
              type="checkbox"
              name="pickupInStore"
              checked={formData.pickupInStore}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Requires shipping</label>
            <input
              type="checkbox"
              name="requiresShipping"
              checked={formData.requiresShipping}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Allowed quantities</label>
            <select
              name="allowedQuantities"
              value={formData.allowedQuantities}
              onChange={handleChange}
              className="w-3/4 mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            >
              <option>1</option>
            </select>
          </div>
        </div> */}

        <div className="dark:text-white p-6 rounded-lg shadow-md space-y-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold text-orange-500 mb-4">Attributes</h2>
            {/* <Link href="/station/Catalogue/Products/addnewattribute">
              <Button
                type="button"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 mt-2 mx-2 rounded-md flex items-center"
              >
                <Plus size={16} className="mr-2" /> Add New Attributes
              </Button>
            </Link> */}
          </div>


          {selectedAttributes.map((attr, index) => (
            <div key={index} className="flex items-center space-x-4 relative">
              <Select
                options={attributes.map(attr => ({ value: attr.id, label: attr.name }))}
                onChange={(selectedOption) => handleAttributeChange(index, 'name', selectedOption.value)}
                value={attr.name ? { value: attr.name, label: attributes.find(a => a.id === attr.name)?.name } : null}
                className="w-1/2 mt-1 block text-black"
                placeholder="Select attribute name"
              />
              <Select
                options={attributes.find(a => a.id === attr.name)?.values || []}
                onChange={(selectedOption) => handleAttributeChange(index, 'value', selectedOption.value)}
                value={attr.value ? { value: attr.value, label: attributes.find(a => a.id === attr.name)?.values.find(v => v.value === attr.value)?.label } : null}
                className="w-1/2 mt-1 block text-black"
                placeholder="Select attribute value"
                isDisabled={!attr.name}
              />
              {index > 0 && (
                <Button
                  type="button"
                  onClick={() => handleRemoveAttribute(index)}
                  className="bg-transparent hover:bg-transparent hover:text-red-700 font-bold text-red-500 absolute -right-9"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          ))}

          {selectedAttributes.length < attributes.length && (
            <Button
              type="button"
              onClick={handleAddAttribute}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Plus size={16} className="mr-2" /> Add
            </Button>
          )}
        </div>


        <div className="dark:text-white p-6 rounded-lg shadow-md space-y-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold text-orange-500 mb-4">Related Products</h2>
            <RelatedProductsModal />
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Selected Related Products:</h3>
            <ul className="list-disc pl-5">
              {formData.relatedproducts.map((product) => (
                <li key={product.relatedproid}>
                  {skuOptions.find(option => option.value === product.relatedproid)?.label || product.relatedproid}
                </li>
              ))}
            </ul>
          </div>
        </div>



        <div className="dark:text-white p-6 rounded-lg shadow-md space-y-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold text-orange-500 mb-4">Multimedia</h2>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Upload size={16} className="mr-2" /> Choose Image
            </Button>
          </div>

          {imageFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Image Previews:</h3>
              <div className="grid grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <img 
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="max-w-xs max-h-64 object-contain"
                  />
                ))}
              </div>
              <Button
                type="button"
                onClick={handleImageUpload}
                className="bg-green-500 hover:bg-green-600 text-white mt-4"
              >
                Upload Images
              </Button>
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Uploaded Images:</h3>
            <div className="grid grid-cols-3 gap-4">
              {uploadedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img 
                    src={image.preview} 
                    alt={image.name} 
                    className="h-52 object-contain rounded"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md focus:outline-none"
          >
            Save
          </button>
          <button
            type="button"
            // onClick={handleReset}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md focus:outline-none"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProductForm;

