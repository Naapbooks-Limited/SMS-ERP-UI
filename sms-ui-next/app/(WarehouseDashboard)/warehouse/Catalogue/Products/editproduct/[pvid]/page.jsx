"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, X, Upload } from "lucide-react";
import Link from "next/link";
import Select from 'react-select';
import CallFor from "@/utilities/CallFor";
import CallFor2 from "@/utilities/CallFor2";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
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

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState();
  const [aspect, setAspect] = useState(1);
  const imageRef = useRef(null);
  const [completedCrop, setCompletedCrop] = useState(null);

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  }

  const handleAspectChange = (newAspect, e) => {
    e.preventDefault(); // Prevent form submission
    setAspect(newAspect);
    if (imageRef.current) {
      const { width, height } = imageRef.current;
      setCrop(centerAspectCrop(width, height, newAspect));
    }
  };

  const handleComplete = (e) => {
    e.preventDefault(); // Prevent form submission
    if (imageRef.current && completedCrop) {
      const canvas = document.createElement('canvas');
      const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
      const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        imageRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      }, 'image/jpeg', 1);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault(); // Prevent form submission
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-4xl w-full">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Crop Image</h3>
          <div className="mt-2 space-x-4">
            <button
              type="button"
              onClick={(e) => handleAspectChange(1, e)}
              className={`px-3 py-1 rounded ${aspect === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              1:1
            </button>
            <button
              type="button"
              onClick={(e) => handleAspectChange(4/3, e)}
              className={`px-3 py-1 rounded ${aspect === 4/3 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              4:3
            </button>
            <button
              type="button"
              onClick={(e) => handleAspectChange(16/9, e)}
              className={`px-3 py-1 rounded ${aspect === 16/9 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              16:9
            </button>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
          >
            <img
              ref={imageRef}
              src={image}
              onLoad={onImageLoad}
              className="max-w-full"
              style={{ maxHeight: '60vh' }}
            />
          </ReactCrop>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleComplete}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

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

  // Add state for categories, manufacturers, and UOM
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [manufacturerOptions, setManufacturerOptions] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [selectedUOM, setSelectedUOM] = useState(null);
const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Add a state to track if options are loaded
  const [optionsLoaded, setOptionsLoaded] = useState(false);

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
      Pvamvaluemodels: [{
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

  const [specifications, setSpecifications] = useState([]);
  const [currentCropImage, setCurrentCropImage] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [pendingImages, setPendingImages] = useState([]);

  // Separate function to fetch dropdown options
  const fetchDropdownOptions = async () => {
    try {
      const response = await CallFor("v2/Product/SaveProduct", "get", null, "Auth");
      const { data } = response;

      // Transform categories data for react-select
      const categories = data.dropdowns.categories.map(cat => ({
        value: cat.id,
        label: cat.name
      }));
      setCategoryOptions(categories);

      // Transform manufacturers data
      const manufacturers = data.dropdowns.manufacturer.map(mfg => ({
        value: mfg.id,
        label: mfg.name
      }));
      setManufacturerOptions(manufacturers);

      // Transform UOM data
      const uoms = data.dropdowns.uoms.map(uom => ({
        value: uom.id,
        label: uom.name
      }));
      setUomOptions(uoms);
      setOptionsLoaded(true);

    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      reToast.error("Failed to load options");
    }
  };

  // Function to set selected values after both options and product data are loaded
  const setSelectedValues = (productData) => {
    // Auto-select categories
    if (productData.productcategorymappings && productData.productcategorymappings.length > 0) {
      const selectedCats = productData.productcategorymappings.map(mapping => {
        const categoryOption = categoryOptions.find(opt => opt.value == mapping.catid);
        return categoryOption;
      }).filter(cat => cat); // Filter out any undefined values
      setSelectedCategories(selectedCats);
    }

    // Auto-select manufacturer
    if (productData.pmanmappings && productData.pmanmappings.length > 0) {
      const manufacturerId = productData.pmanmappings[0].manid;
      const mfg = manufacturerOptions.find(opt => opt.value == manufacturerId);
      if (mfg) {
        setSelectedManufacturer(mfg);
      }
    }

    // Auto-select UOM
    if (productData.prouom) {
      const uom = uomOptions.find(opt => opt.value == productData.prouom);
      if (uom) {
        setSelectedUOM(uom);
      }
    }

    
  };

  // Update fetchProductData to handle the sequence
  const fetchProductData = async () => {
    try {
      if (!optionsLoaded) {
        await fetchDropdownOptions();
      }

      const response = await CallFor(`v2/Product/GetProductVariantByPvId?PvId=${params.pvid}`, "get", null, "Auth");
      if (response.data && response.data.data) {
        const apiData = response.data.data;

        // Handle image previews from pvummappings
        if (apiData.pvummappings && apiData.pvummappings.length > 0) {
          const imageUrls = apiData.pvummappings
            .filter(mapping => mapping.productimg && mapping.productimg.umurl)
            .map(mapping => `${process.env.NEXT_PUBLIC_VIEW_DOCUMENT}/${mapping.productimg.umurl}`);

          // Set image previews with the fetched URLs
          setImagePreviews(imageUrls);
        }

        // Transform the pvamappings to move pvamvalues to Pvamvaluemodels
        if (apiData.pvamappings) {
          apiData.pvamappings = apiData.pvamappings.map(mapping => ({
            ...mapping,
            Pvamvaluemodels: mapping.pvamvalues || [],
            pvamvalues: [] // Keep empty array for backward compatibility
          }));
        }

        // Set related products and attributes
        const customAttributes = apiData.pvamappings.filter(mapping => mapping.ispecification !== true );
        setSelectedAttributes(customAttributes.map(mapping => ({
          name: mapping.attributeid,
          values: mapping.Pvamvaluemodels.map(val => val.avid)
        })));

        // Set specifications from pvamappings where ispecification is true
        const specs = apiData.pvamappings
          .filter(mapping => mapping.ispecification == true)
          .map(mapping => ({
            attributeName: mapping.attrname || '',
            attributeValues: mapping.Pvamvaluemodels.map(val => val.avname)
          }));
        setSpecifications(specs);

        // Set uploaded images from pvummappings
        if (apiData.pvummappings) {
          const images = apiData.pvummappings.map(mapping => ({
            id: mapping.productimgid,
            preview: `${process.env.NEXT_PUBLIC_VIEW_DOCUMENT}/${mapping.productimg.umurl}`,
            name: mapping.productimg.umname
          }));
          setUploadedImages(images);
        }

        // Set form data
        setFormData(prevData => ({
          ...prevData,
          ...apiData,
        }));

        // Set selected values after both options and data are loaded
        setSelectedValues(apiData);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      reToast.error("Failed to fetch product details");
    }
  };

  // Add useEffect to watch for options loading
  useEffect(() => {
    fetchDropdownOptions();
  }, []);

  // Update the useEffect for fetching product data
  useEffect(() => {
    if (optionsLoaded) {
      fetchProductData();
    }
  }, [params.pvid, optionsLoaded]);

  

  const handleReplaceImage = async (event, index) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    // Prepare FormData for upload
    const productFormData = new FormData();
    productFormData.append(`productImgModelList[0].Umurl`, file);
    productFormData.append(`productImgModelList[0].Uid`, Uid);
    productFormData.append(`productImgModelList[0].Umid`, "0");
    productFormData.append(`productImgModelList[0].Umname`, file.name);
    productFormData.append(`productImgModelList[0].Umalttext`, file.name);
    productFormData.append(`productImgModelList[0].Umsizes`, "0");
    productFormData.append(`productImgModelList[0].Umbytes`, "0");
    productFormData.append(`productImgModelList[0].Umtype`, "2");

    const response = await CallFor(
      "v2/Product/SaveMultipleProductImages",
      "post",
      productFormData,
      "authWithContentTypeMultipart"
    );
    const uploaded = response.data.data?.[0];
    if (!uploaded) throw new Error("No image returned from server");

    // Update uploadedImages and pvummappings at the same index
    setUploadedImages(prev => {
      const newArr = [...prev];
      newArr[index] = {
        id: uploaded.productimgid,
        preview: uploaded.productimg && uploaded.productimg.umurl
          ? `${process.env.NEXT_PUBLIC_VIEW_DOCUMENT}/${uploaded.productimg.umurl}`
          : URL.createObjectURL(file),
        name: file.name
      };
      return newArr;
    });

    setFormData(prevData => {
      const newMappings = [...(prevData.pvummappings || [])];
      newMappings[index] = {
        ...newMappings[index],
        productimgid: uploaded.productimgid
      };
      // Optionally update pvdefaultimgid if replacing the first image
      return {
        ...prevData,
        pvdefaultimgid: index === 0 ? uploaded.productimgid : prevData.pvdefaultimgid,
        pvummappings: newMappings
      };
    });

    reToast.success("Image replaced!");
  } catch (error) {
    console.error("Error replacing image:", error);
    reToast.error("Failed to replace image");
  }
};

  

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
                checked={formData.relatedproducts.some(p => p.relatedproid == product.value)}
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

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const newPendingImages = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        cropped: false
      }));
      setPendingImages(prev => [...prev, ...newPendingImages]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropClick = (index) => {
    const image = pendingImages[index];
    setSelectedImageIndex(index);
    setTempImageUrl(image.preview);
    setCurrentCropImage(image.file);
  };

  const handleCropComplete = async (croppedBlob) => {
    const croppedFile = new File([croppedBlob], currentCropImage.name, {
      type: 'image/jpeg',
      lastModified: new Date().getTime()
    });

    // Update the pending image with the cropped version
    setPendingImages(prev => {
      const updated = [...prev];
      const newPreview = URL.createObjectURL(croppedBlob);
      updated[selectedImageIndex] = {
        file: croppedFile,
        preview: newPreview,
        cropped: true
      };
      return updated;
    });

    setCurrentCropImage(null);
    setTempImageUrl(null);
    setSelectedImageIndex(null);
  };

  const handleCropCancel = () => {
    setCurrentCropImage(null);
    setTempImageUrl(null);
    setSelectedImageIndex(null);
  };

  const handleRemovePendingImage = (index) => {
    setPendingImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview); // Clean up object URL
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleImageUpload = async () => {
    if (!pendingImages.length) return;

    try {
      const productImages = pendingImages.map(({ file }) => ({
        Umurl: file,
        Uid: Uid,
        Umid: "0",
        Umname: file.name,
        Umalttext: file.name,
        Umsizes: "0",
        Umbytes: "0",
        Umtype: "2"
      }));

      const productFormData = new FormData();
      productImages.forEach((img, index) => {
        Object.keys(img).forEach(key => {
          productFormData.append(`productImgModelList[${index}].${key}`, img[key]);
        });
      });

      const response = await CallFor(
        "v2/Product/SaveMultipleProductImages",
        "post",
        productFormData,
        "authWithContentTypeMultipart"
      );

      if (response.data.status === true) {
        // Update form data with new images
        const newImages = response.data.data.map((img, index) => ({
          id: img.productimgid,
          preview: `${process.env.NEXT_PUBLIC_VIEW_DOCUMENT}/${img.umurl}`, // Use the URL from response
          name: pendingImages[index].file.name
        }));

        setImagePreviews(prev => [...prev, ...newImages.map(img => img.preview)]);
        setFormData(prevData => ({
          ...prevData,
          pvdefaultimgid: prevData.pvdefaultimgid || response.data.data[0].productimgid,
          pvummappings: [
            ...prevData.pvummappings,
            ...response.data.data.map(img => ({
              pvumid: img.pvumid,
              proid: prevData.proid,
              pvid: prevData.pvid,
              productimgid: img.productimgid,
              productimg: {
                umurl: img.umurl
              }
            }))
          ]
        }));

        // Clean up pending images
        pendingImages.forEach(img => URL.revokeObjectURL(img.preview));
        setPendingImages([]);

        reToast.success("Images uploaded successfully!");
      } else {
        reToast.error("Failed to upload images");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      reToast.error("Failed to upload images");
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
        const data = response.data;
        
        // Map SKUs
        setSkuOptions(data.dropdowns.sku.map(sku => ({ 
          value: sku.key, 
          label: sku.value 
        })));
        
        // Map Currency
        setCurrencyOptions(data.dropdowns.currency.map(curr => ({ 
          value: curr.id, 
          label: curr.name 
        })));
        
        // Map Attributes with their values
        const mappedAttributes = data.dropdowns.attributes.map(attr => ({
          id: attr.id,
          name: attr.name,
          values: attr.subdata.map(sub => ({
            value: sub.id,
            label: sub.name
          }))
        }));
        setAttributes(mappedAttributes);
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
      [name]: type == "checkbox" ? checked : value
    };
    setFormData(newFormData);
    // saveFormDataToSessionStorage(newFormData);
  };

  const [selectedAttributes, setSelectedAttributes] = useState([{ name: null, values: [] }]);

  const handleAddAttribute = () => {
    setSelectedAttributes([...selectedAttributes, { name: null, values: [] }]);
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
    } else if (type === 'value') {
      newAttributes[index] = {
        ...newAttributes[index],
        values: value
      };
    }
    setSelectedAttributes(newAttributes);

    setFormData(prevData => {
      const newPvamappings = [...prevData.pvamappings];
      
      if (type === 'name') {
        const selectedAttr = attributes.find(attr => attr.id === value);
        newPvamappings[index] = {
          pvamid: 0,
          proid: prevData.proid,
          pvid: prevData.pvid || null,
          attributeid: value,
          attributeName: selectedAttr?.name || null,
          attrtextprompt: null,
          isrequired: false,
          controltype: null,
          displayorder: null,
          Pvamvaluemodels: [],
          pvamvalues: [] // Keep empty array for backward compatibility
        };
      } else if (type === 'value') {
        const selectedAttribute = attributes.find(attr => attr.id === newAttributes[index].name);
        
        newPvamappings[index] = {
          ...newPvamappings[index],
          Pvamvaluemodels: value.map(valueId => {
            const valueObj = selectedAttribute?.values.find(v => v.value === valueId);
            return {
              pvamvid: 0,
              pvamid: null,
              avid: valueId,
              pvamvcolor: null,
              umid: null,
              attributeValueName: valueObj?.label || '',
              displayorder: null,
              avname: valueObj?.label || ''
            };
          }),
          pvamvalues: [] // Keep empty array for backward compatibility
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

  // Add specification handling functions
  const handleSpecificationChange = (index, field, value) => {
    const newSpecifications = [...specifications];
    if (field == "attributeValues") {
      // Split comma-separated values into array if it's a string
      newSpecifications[index][field] = typeof value == 'string' ? value.split(',').map(v => v.trim()) : value;
    } else {
      newSpecifications[index][field] = value;
    }
    setSpecifications(newSpecifications);
  };

  const handleAddSpecification = () => {
    setSpecifications([...specifications, { attributeName: '', attributeValues: [] }]);
  };

  const handleRemoveSpecification = (index, e) => {
    e.preventDefault();
    const newSpecifications = [...specifications];
    newSpecifications.splice(index, 1);
    setSpecifications(newSpecifications);
  };

  // Modify the handleSubmit function to exclude deleted images
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Prepare specifications data
      const preparedSpecifications = specifications.map(spec => ({
        attributeid: 0,
        attributename: spec.attributeName,
        description: spec.attributeName,
        attributeicon: "string",
        attributecolor: "string",
        uoid: orgid,
        isspecification: true,
        Pvamvaluemodels: Array.isArray(spec.attributeValues) 
          ? spec.attributeValues.map(val => ({
              pvamvid: 0,
              pvamid: 0,
              avid: 0,
              pvamvcolor: "string",
              umid: 0,
              displayorder: 0,
              attributeValueName: val.trim(),
              avname: val.trim()
            }))
          : typeof spec.attributeValues == 'string'
            ? spec.attributeValues.split(',').map(val => ({
                pvamvid: 0,
                pvamid: 0,
                avid: 0,
                pvamvcolor: "string",
                umid: 0,
                displayorder: 0,
                attributeValueName: val.trim(),
                avname: val.trim()
              }))
            : [],
        pvamvalues: [] // Keep empty array for backward compatibility
      }));

      // Ensure custom attributes in pvamappings have ispecification: false
      const fixedPvamappings = formData.pvamappings.map(mapping => ({
        ...mapping,
        ispecification: false,
        Pvamvaluemodels: mapping.Pvamvaluemodels || [],
        pvamvalues: [] // Keep empty array for backward compatibility
      }));

      const dataToSend = {
        ...formData,
        specification: preparedSpecifications,
        productcategorymappings: selectedCategories.map(cat => ({
          id: 0,
          proid: formData.proid,
          catid: cat.value
        })),
        manufacturerid: selectedManufacturer?.value || null,
        prouom: selectedUOM?.value || null,
        pvummappings: formData.pvummappings.filter(
          mapping => mapping.productimgid !== null && mapping.productimgid !== undefined
        ),
        pvamappings: fixedPvamappings,
      };

      const response = await CallFor(
        "v2/Product/UpdateProductvariant",
        "post",
        JSON.stringify(dataToSend),
        "Auth"
      );

      if (response) {
        reToast.success("Product updated successfully!");
        router.push("/warehouse/Catalogue/Products");
      } else {
        reToast.error(response.data.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error:", error);
      reToast.error("Failed to update product");
    }
    finally {
    setIsSubmitting(false); // Re-enable button
  }
  };
  

  // Modify the handleRemoveImage function
  const handleRemoveImage = async (imageId) => {
    try {
      setDeletedImageIds(prevIds => [...prevIds, imageId]);
      setUploadedImages(prevImages => prevImages.filter(img => img.id !== imageId));
      setFormData(prevData => ({
        ...prevData,
        pvummappings: prevData.pvummappings.filter(
          mapping => mapping.productimgid !== imageId
        )
      }));
      // Clear file input to allow new uploads
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setImageFiles([]);
      setImagePreviews([]);
    } catch (error) {
      console.error("Error removing image:", error);
    }
  };

  // Add handlers for dropdown changes
  const handleCategoryChange = (selected) => {
    setSelectedCategories(selected);
    setFormData(prev => ({
      ...prev,
      productcategorymappings: selected.map(cat => ({
        id: 0,
        proid: prev.proid,
        catid: cat.value
      }))
    }));
  };

  const handleManufacturerChange = (selected) => {
    setSelectedManufacturer(selected);
    setFormData(prev => ({
      ...prev,
      manufacturerid: selected?.value || null
    }));
  };

  const handleUOMChange = (selected) => {
    setSelectedUOM(selected);
    setFormData(prev => ({
      ...prev,
      prouom: selected?.value || null
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Product</h1>
        <Link href="/warehouse/Catalogue/Products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-orange-500">Basic Information</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Edit the fundamental details of your product.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pvname"
                value={formData.pvname}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pvsku"
                value={formData.pvsku}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Barcode */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Barcode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pvbarcode"
                value={formData.pvbarcode}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Categories <span className="text-red-500">*</span>
              </label>
              <Select
                isMulti
                options={categoryOptions}
                value={selectedCategories}
                onChange={handleCategoryChange}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </div>

            {/* Manufacturer */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Manufacturer <span className="text-red-500">*</span>
              </label>
              <Select
                options={manufacturerOptions}
                value={selectedManufacturer}
                onChange={handleManufacturerChange}
                className="basic-select"
                classNamePrefix="select"
              />
            </div>

            {/* Unit of Measure */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Unit of Measure <span className="text-red-500">*</span>
              </label>
              <Select
                options={uomOptions}
                value={selectedUOM}
                onChange={handleUOMChange}
                className="basic-select"
                classNamePrefix="select"
              />
            </div>

            {/* Description */}
            <div className="space-y-2 col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                name="pvdesc"
                value={formData.pvdesc}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Short Description */}
            <div className="space-y-2 col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Short Description
              </label>
              <textarea
                name="shortdesc"
                value={formData.shortdesc}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Published */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => handleChange({ target: { name: 'isPublished', value: checked } })}
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Published
                </label>
              </div>
            </div>

            {/* Show on Homepage */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="displayOnHomePage"
                  checked={formData.displayOnHomePage}
                  onCheckedChange={(checked) => handleChange({ target: { name: 'displayOnHomePage', value: checked } })}
                />
                <label htmlFor="displayOnHomePage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show on Homepage
                </label>
              </div>
            </div>

            {/* Mark as New */}
            <div className="space-y-2 col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="markAsNew"
                  checked={formData.markAsNew}
                  onCheckedChange={(checked) => handleChange({ target: { name: 'markAsNew', value: checked } })}
                />
                <label htmlFor="markAsNew" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mark as New
                </label>
              </div>
              {formData.markAsNew && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                    <input
                      type="datetime-local"
                      name="markAsNewStartDateTimeUtc"
                      value={formData.markAsNewStartDateTimeUtc}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                    <input
                      type="datetime-local"
                      name="markAsNewEndDateTimeUtc"
                      value={formData.markAsNewEndDateTimeUtc}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Available Dates */}
            <div className="space-y-2 col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Available Date Range <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="datetime-local"
                    name="availabledate"
                    value={formData.availabledate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="datetime-local"
                    name="enddate"
                    value={formData.enddate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-orange-500">Pricing</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Set up your product's pricing strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Currency */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Currency <span className="text-red-500">*</span>
              </label>
              <Select
                options={currencyOptions}
                value={currencyOptions.find(option => option.value == formData.pvcurrencyid)}
                onChange={handleCurrencyChange}
                className="basic-select"
                classNamePrefix="select"
              />
            </div>

            {/* Purchase Price */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Purchase Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pvpurchaseprice"
                value={formData.pvpurchaseprice}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Sales Price */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sales Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pvsalesprice"
                value={formData.pvsalesprice}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Old Price */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Old Price
              </label>
              <input
                type="number"
                name="pvoldprice"
                value={formData.pvoldprice}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Special Price */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Special Price
              </label>
              <input
                type="number"
                name="pvspecialprice"
                value={formData.pvspecialprice}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Special Price Date Range */}
            <div className="space-y-2 col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Special Price Date Range
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="datetime-local"
                    name="pvspstartdate"
                    value={formData.pvspstartdate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="datetime-local"
                    name="pvspenddate"
                    value={formData.pvspenddate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Information Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-orange-500">Tax Information</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Configure tax settings for your product.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tax Exempt */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="taxExempt"
                  checked={formData.taxExempt}
                  onCheckedChange={(checked) => handleChange({ target: { name: 'taxExempt', value: checked } })}
                />
                <label htmlFor="taxExempt" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tax Exempt
                </label>
              </div>
            </div>

            {/* Tax Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tax Category
              </label>
              <input
                type="text"
                name="taxCategory"
                value={formData.taxCategory}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tax Rate */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tax Rate (%)
              </label>
              <input
                type="number"
                name="taxrate"
                value={formData.provarianttaxes[0]?.taxrate}
                onChange={(e) => handleChange({
                  target: {
                    name: 'provarianttaxes',
                    value: [{ ...formData.provarianttaxes[0], taxrate: e.target.value }]
                  }
                })}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* HSN Code */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                HSN Code
              </label>
              <input
                type="text"
                name="hsncode"
                value={formData.provarianttaxes[0]?.hsncode}
                onChange={(e) => handleChange({
                  target: {
                    name: 'provarianttaxes',
                    value: [{ ...formData.provarianttaxes[0], hsncode: e.target.value }]
                  }
                })}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Product Images Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-orange-500">Product Images</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Upload high-quality images of your product. First image will be set as default.
            </p>
          </div>

          <div className="space-y-4">
            {/* Image Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                id="image-upload"
                multiple
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <Upload className="w-12 h-12 text-gray-400" />
                <span className="text-gray-600">Click to upload or drag and drop</span>
                <span className="text-sm text-gray-500">PNG, JPG up to 10MB</span>
              </label>
            </div>

            {/* Image Cropper */}
            {tempImageUrl && currentCropImage && (
              <ImageCropper
                image={tempImageUrl}
                onCropComplete={handleCropComplete}
                onCancel={handleCropCancel}
              />
            )}

            {/* Pending Images */}
            {pendingImages.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    New Images
                  </h3>
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
                  >
                    <Upload size={16} />
                    <span>Upload All Images</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {pendingImages.map((image, index) => (
                    <div key={index} className="relative group aspect-square">
                      <div className="w-full h-full rounded-lg overflow-hidden">
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-contain"
                          style={{
                            backgroundColor: '#f3f4f6', // Light gray background
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleCropClick(index)}
                          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2V7H7v5H5V5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePendingImage(index)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {image.cropped && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded">
                          Cropped
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Images */}
            {uploadedImages.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Uploaded Images
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={image.id} className="relative group aspect-square">
                      <div className="w-full h-full rounded-lg overflow-hidden">
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-full h-full object-contain"
                          style={{
                            backgroundColor: '#f3f4f6', // Light gray background
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(image.id)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 text-xs rounded">
                          Default
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Attributes Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-orange-500">Product Attributes</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Define product specifications and attributes.
            </p>
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Specifications
              </h3>
              <button
                type="button"
                onClick={handleAddSpecification}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>Add Specification</span>
              </button>
            </div>

            {specifications.map((spec, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Specification Name
                  </label>
                  <input
                    type="text"
                    value={spec.attributeName}
                    onChange={(e) => handleSpecificationChange(index, 'attributeName', e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Values (comma-separated)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={Array.isArray(spec.attributeValues) ? spec.attributeValues.join(', ') : spec.attributeValues || ''}
                      onChange={(e) => handleSpecificationChange(index, 'attributeValues', e.target.value)}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter values separated by commas"
                    />
                    {specifications.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSpecification(index, e)}
                        className="px-2 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Attributes */}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Custom Attributes
              </h3>
              <div className='flex gap-2'>
                <button
                  type="button"
                  onClick={handleAddAttribute}
                  className="px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-1"
                >
                  <Plus size={16} />
                  <span>Create Attribute</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleAddAttribute}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-1"
                >
                  <Plus size={16} />
                  <span>Add Attribute</span>
                </button>
              </div>
            </div>

            {selectedAttributes.map((attr, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Attribute
                  </label>
                  <Select
                    options={attributes.map(attr => ({ value: attr.id, label: attr.name }))}
                    onChange={(selectedOption) => handleAttributeChange(index, 'name', selectedOption.value)}
                    value={attr.name ? { value: attr.name, label: attributes.find(a => a.id == attr.name)?.name } : null}
                    className="basic-select"
                    classNamePrefix="select"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Value
                  </label>
                  <div className="flex space-x-2">
                    <Select
                      isMulti
                      options={attributes.find(a => a.id == attr.name)?.values || []}
                      onChange={(selectedOptions) => {
                        const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
                        handleAttributeChange(index, 'value', values);
                      }}
                      value={
                        attr.values 
                          ? attr.values.map(value => {
                              const attrValues = attributes.find(a => a.id == attr.name)?.values || [];
                              const valueObj = attrValues.find(v => v.value == value);
                              return valueObj ? { value: valueObj.value, label: valueObj.label } : null;
                            }).filter(Boolean)
                          : []
                      }
                      className="basic-select flex-1"
                      classNamePrefix="select"
                      isDisabled={!attr.name}
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttribute(index)}
                        className="px-2 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-orange-500">Related Products</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Link this product to related items.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Selected Products
              </h3>
              <RelatedProductsModal />
            </div>

            <div className="mt-4">
              <ul className="space-y-2">
                {formData.relatedproducts.map((product) => (
                  <li key={product.relatedproid} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span>{skuOptions.find(option => option.value == product.relatedproid)?.label || product.relatedproid}</span>
                    <button
                      onClick={() => handleRelatedProductChange(product.relatedproid, false)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/warehouse/Catalogue/Products')}
          >
            Cancel
          </Button>
        <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>
  {isSubmitting ? "Saving..." : "Save Changes"}
</Button>
        </div>
      </form>
    </div>
  );
}

export default EditProductForm;

