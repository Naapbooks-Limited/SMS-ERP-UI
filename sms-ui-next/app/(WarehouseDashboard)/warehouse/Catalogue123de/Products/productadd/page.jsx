
"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, X, Upload } from "lucide-react";
import Link from "next/link";
import Select from 'react-select';
import CallFor from "@/utilities/CallFor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast as reToast } from "react-hot-toast";

const ProductForm = () => {

  const pathname = usePathname();
  const router = useRouter()
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const Uid = userData.uid ;
  const orgid = userData.orgid
  const [formData, setFormData] = useState({
    pvid: 0,
    proid: 0,
    pvname: "",
    pvdesc: "",
    shortdesc: "",
    pvbarcode: "",
    pvsku: "",
    pvdefaultimgid: '',
    pvstatus: 0,
    pvcurrencyid: 1,
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
    relatedProducts: [],
    relatedProducts: []
  });

  useEffect(() => {
    const handleRouteChange = () => {
      console.log("pathname", pathname);
      const validRoutes = [
        '/warehouse/Catalogue/Products/productadd',
        '/warehouse/Catalogue/Products/addnewattribute'
      ];
    
      console.log("route", validRoutes.includes(pathname));

      if (!validRoutes.includes(pathname)) {
        // Clear session storage and form data
        sessionStorage.removeItem('productFormData');
        sessionStorage.removeItem('imagePreview');
        setFormData({
          pvid: 0,
          proid: 0,
          pvname: "",
          pvdesc: "",
          shortdesc: "",
          pvbarcode: "",
          pvsku: "",
          pvdefaultimgid: 537,
          pvstatus: 0,
          pvcurrencyid: 1,
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
          relatedProducts: [],
          relatedProducts: []
        });
        setImagePreview(null);
      }
    };

    handleRouteChange();

    // Load saved data when component mounts
    const savedFormData = sessionStorage.getItem('productFormData');
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
    const savedImagePreview = sessionStorage.getItem('imagePreview');
    if (savedImagePreview) {
      setImagePreview(savedImagePreview);
    }
  }, [pathname]);


 
  ////
  const saveFormDataToSessionStorage = (data) => {
    sessionStorage.setItem('productFormData', JSON.stringify(data));
  };

  useEffect(() => {
    const savedFormData = sessionStorage.getItem('productFormData');
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
    const savedImagePreview = sessionStorage.getItem('imagePreview');
    if (savedImagePreview) {
      setImagePreview(savedImagePreview);
    }
  }, []);

  // const [attributes, setAttributes] = useState([]);
  const [skuOptions, setSkuOptions] = useState([]);

  const [isRelatedProductsModalOpen, setIsRelatedProductsModalOpen] = useState(false);
  // const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  // const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  // const fileInputRef = useRef(null);
  // const [formData, setFormData] = useState({
  //   pvamappings: []
  // });

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
                checked={formData.relatedProducts.some(p => p.relatedproid === product.value)}
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
    if (!imageFile) return;

    const imageFormData = new FormData();
    imageFormData.append("Umurl", imageFile);
    imageFormData.append("Uid", Uid);
    imageFormData.append("Umid", 0);
    imageFormData.append("Umname", imageFile.name);
    imageFormData.append("Umalttext", "aa");
    imageFormData.append("Umsizes", imageFile.size);
    imageFormData.append("Umbytes", imageFile.size);
    imageFormData.append("Umextenstion", imageFile.name.split(".").pop());
    imageFormData.append("Umtype", 2);

    try {
      const response = await CallFor("v2/Product/SaveProductImages", "post", imageFormData, "authWithContentTypeMultipart");
      const imageId = response.data;

      setFormData(prevData => ({
        ...prevData,
        pvdefaultimgid: imageId,
        pvummappings: [
          ...prevData.pvummappings,
          {
            pvumid: 0,
            proid: null,
            pvid: null,
            productimgid: imageId
          }
        ]
      }));

      // Clear the file input and preview
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        sessionStorage.setItem('imagePreview', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRelatedProductChange = (productId, isChecked) => {
    setFormData(prevData => {
      const newData = {
        ...prevData,
        relatedProducts: isChecked
          ? [...prevData.relatedProducts, { ppmid: 0, pvid: 0, relatedproid: productId }]
          : prevData.relatedProducts.filter(product => product.relatedproid !== productId)
      };
      saveFormDataToSessionStorage(newData);
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
    saveFormDataToSessionStorage(newFormData);
  };

  const [selectedAttributes, setSelectedAttributes] = useState([{ name: null, value: null }]);

  const handleAddAttribute = () => {
    setSelectedAttributes([...selectedAttributes, { name: null, value: [] }]);
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
    if (type === 'name') {
      newAttributes[index] = { name: value, values: [] };
    } else if (type === 'values') {
      newAttributes[index].values = value;
    }
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
          isrequired: false,
          controltype: null,
          displayorder: null,
          pvamvaluemodels: []
        };
      } else if (type === 'values') {
        newPvamappings[index] = {
          ...newPvamappings[index],
          pvamvaluemodels: value.map(v => ({
            pvamvid: 0,
            pvamid: null,
            avid: v.value,
            pvamvcolor: null,
            umid: null,
            attributeValueName: v.label,
            displayorder: null
          }))
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



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await CallFor("v2/Product/SaveProductvariant", "post", JSON.stringify(formData), "Auth");
      if (response.data.status == true) {
        reToast.success("Product saved successfully!");
        router.push("/warehouse/Catalogue/Products");
      }
      // if (!response.ok) {
      //   throw new Error("Network response was not ok");
      // }
      const result = await response.json();
      console.log("Success:", result);
      // Handle success (e.g., show a success message, redirect, etc.)
      localStorage.removeItem('productFormData');

      
    } catch (error) {
      console.error("Error:", error);
      // Handle error (e.g., show an error message)
    }
  };
  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="dark:text-white p-6 rounded-lg shadow-md space-y-4">
          {/* <h2 className="text-2xl font-bold text-orange-500 mb-4">Product Variant</h2> */}
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold text-orange-500 mb-4">Product Variant</h2>
            <Link href="/warehouse/Catalogue/Products/skurequest">
              <Button color="warning" className="shadow-md">
                <Plus size={20} className="pr-1" />
                Request SKU
              </Button>
            </Link>
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
            <Link href="/warehouse/Catalogue/Products/addnewattribute">
          <Button
            type="button"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 mt-2 mx-2 rounded-md flex items-center"
          >
            <Plus size={16} className="mr-2" /> Add New Attributes
          </Button>
        </Link>
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
                onChange={(selectedOptions) => handleAttributeChange(index, 'values', selectedOptions)}
                value={attr.values}
                className="w-1/2 mt-1 block text-black"
                placeholder="Select attribute values"
                isDisabled={!attr.name}
                isMulti
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
              {formData.relatedProducts.map((product) => (
                <li key={product.relatedproid}>
                  {skuOptions.find(option => option.value === product.relatedproid)?.label}
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
          
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              onClick={handleImageUpload}
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={!imageFile}
            >
              Upload Image
            </Button>
          </div>
          {imagePreview && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Image Preview:</h3>
              <img src={imagePreview} alt="Preview" className="max-w-xs max-h-64 object-contain" />
            </div>
          )}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Uploaded Images:</h3>
            <div className="grid grid-cols-3 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={image.id} className="relative">
                  <img src={image.preview} alt={`Uploaded ${index + 1}`} className="w-full h-32 object-cover rounded" />
                  <Button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                  >
                    <Trash2 size={16} />
                  </Button>
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

export default ProductForm;

