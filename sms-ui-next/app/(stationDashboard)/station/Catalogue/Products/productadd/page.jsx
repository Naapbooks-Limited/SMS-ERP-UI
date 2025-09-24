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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast as reToast } from "react-hot-toast";
import CreatableSelect from 'react-select/creatable';

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
  const [isSaving, setIsSaving] = useState(false);

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
              type="button" // Add type="button"
              onClick={(e) => handleAspectChange(1, e)}
              className={`px-3 py-1 rounded ${aspect === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              1:1
            </button>
            <button
              type="button" // Add type="button"
              onClick={(e) => handleAspectChange(4/3, e)}
              className={`px-3 py-1 rounded ${aspect === 4/3 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              4:3
            </button>
            <button
              type="button" // Add type="button"
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
            type="button" // Add type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="button" // Add type="button"
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

const ProductForm = () => {
  const pathname = usePathname();
  const router = useRouter()
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const Uid = userData.uid;
  const orgid = userData.orgid
  const uaid = userData.uaid;
  const fileInputRef = useRef(null);

  // Form-related state
  const [formData, setFormData] = useState({
    pvid: 0,
    proid: null,
    pvname: "",
    pvdesc: "",
    shortdesc: "",
    pvbarcode: "",
    pvsku: "",
    pvdefaultimgid: '',
    pvstatus: 0,
    pvcurrencyid: null,
    pvsalesprice: "",
    pvpurchaseprice: "",
    pvoldprice: "",
    pvspecialprice: "",
    pvspstartdate: "",
    pvspenddate: "",
    orgid: orgid,
    warehouseid: uaid,
    autorenew: false,
    safetylevel: null,
    reorderlevel: null,
    availabledate: "",
    enddate: "",
    openingstock: "",
    openingstockdate: "",
    closingstock: "",
    closingstockdate: "",
    isinclusive: false,
    moq: null,
    isPublished: false,
    markAsNew: false,
    markAsNewStartDateTimeUtc: "",
    markAsNewEndDateTimeUtc: "",
    isdeleted: false,
    proid: null,
    pictureNopIds: [],
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
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [skuValue, setSkuValue] = useState(null);
  const [isSkuFetched, setIsSkuFetched] = useState(false);
  const [editableWithSku, setEditableWithSku] = useState([
    'pvsalesprice',
    'pvpurchaseprice',
    'pvoldprice',
    'pvspecialprice',
    'pvspstartdate',
    'pvspenddate',
    'openingstock',
    'openingstockdate',
    'closingstock',
    'closingstockdate',
    'safetylevel',
    'reorderlevel',
    'moq'
  ]);

  // Dropdown options state
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [manufacturerOptions, setManufacturerOptions] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState([]);

  // Selected values state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [selectedUOM, setSelectedUOM] = useState(null);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState([{ name: null, value: null }]);

  // Product details state
  const [specifications, setSpecifications] = useState([{ 
    attributeName: '', 
    attributeValues: [] 
  }]);
  const [keywords, setKeywords] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [isRelatedProductsModalOpen, setIsRelatedProductsModalOpen] = useState(false);

  // Image handling state
  const [uploadedImageName, setUploadedImageName] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentCropImage, setCurrentCropImage] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [pendingImages, setPendingImages] = useState([]);

// Updated useEffect for route handling to restore image state
useEffect(() => {
  const handleRouteChange = () => {
    const validRoutes = [
      '/station/Catalogue/Products/productadd',
      '/station/Catalogue/Products/addnewattribute'
    ];

    // Only clear data if we're not in valid routes
    if (!validRoutes.includes(pathname)) {
      // Clear session storage and form data
      sessionStorage.removeItem('productFormData');
      sessionStorage.removeItem('imagePreviews');
      
      // Clean up any existing blob URLs
      uploadedImages.forEach(img => {
        if (img.preview && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
      });
      
      // Reset all state to initial values
      setFormData({
        // ... your initial formData structure
      });
      setImagePreviews([]);
      setUploadedImages([]);
      setSelectedCategories([]);
      setSelectedManufacturer(null);
      setSelectedUOM(null);
      setSpecifications([{ attributeName: '', attributeValues: [] }]);
      setKeywords('');
      setSelectedAttributes([{ name: null, value: null }]);
      setSkuValue(null);
    } else {
      // Load saved data when in valid routes
      const savedFormData = sessionStorage.getItem('productFormData');
      if (savedFormData) {
        const parsedData = JSON.parse(savedFormData);
        
        // Restore form data
        setFormData(prevData => ({
          ...prevData,
          ...parsedData
        }));
        
        // Restore image state
        if (parsedData.uploadedImages) {
          setUploadedImages(parsedData.uploadedImages);
        }
        if (parsedData.imagePreviews) {
          setImagePreviews(parsedData.imagePreviews);
        }
        
        // Restore all other state
        if (parsedData.selectedCategories) setSelectedCategories(parsedData.selectedCategories);
        if (parsedData.selectedManufacturer) setSelectedManufacturer(parsedData.selectedManufacturer);
        if (parsedData.selectedUOM) setSelectedUOM(parsedData.selectedUOM);
        if (parsedData.specifications) setSpecifications(parsedData.specifications);
        if (parsedData.keywords) setKeywords(parsedData.keywords);
        if (parsedData.selectedAttributes) setSelectedAttributes(parsedData.selectedAttributes);
        if (parsedData.skuValue) setSkuValue(parsedData.skuValue);
      }
    }
  };

  handleRouteChange();
}, [pathname]);

  // Update saveFormDataToSessionStorage to save more complete data
 const saveFormDataToSessionStorage = (data) => {
  const completeData = {
    ...data,
    selectedCategories,
    selectedManufacturer,
    selectedUOM,
    specifications,
    keywords,
    selectedAttributes,
    skuValue,
    productcategorymappings: data.productcategorymappings || [],
    manufacturerid: data.manufacturerid,
    prouom: data.prouom,
    provarianttaxes: data.provarianttaxes || [],
    pvamappings: data.pvamappings || [],
    pvummappings: data.pvummappings || [],
    relatedProducts: data.relatedProducts || [],
    // Save image state
    uploadedImages: uploadedImages,
    imagePreviews: imagePreviews
  };

  // Save main form data
  sessionStorage.setItem('productFormData', JSON.stringify(completeData));
};

  // Add this useEffect to fetch data
useEffect(() => {
  const fetchData = async () => {
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

    } catch (error) {
      console.error("Error fetching data:", error);
      reToast.error("Failed to load options");
    }
  };

  fetchData();
}, []);

// Add these handlers
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

const handleSpecificationChange = (index, field, value) => {
  const newSpecifications = [...specifications];
  if (field === "attributeValues") {
    // Split comma-separated values into array if it's a string
    newSpecifications[index][field] = typeof value === 'string' ? value.split(',').map(v => v.trim()) : value;
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

const handleProVariantsChange = (e) => {
  setKeywords(e.target.value);
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
      // Create new images array with uploaded images
      const newImages = response.data.data.map((img, index) => ({
        id: img.productimgid,
        preview: pendingImages[index].preview, // Keep the existing preview
        name: pendingImages[index].file.name
      }));

      // Add to uploaded images without clearing previews
      setUploadedImages(prev => [...prev, ...newImages]);
      
      // Update imagePreviews to maintain the preview state
      setImagePreviews(prev => [
        ...prev, 
        ...newImages.map(img => img.preview)
      ]);

      // Update form data
      setFormData(prevData => {
        const updatedFormData = {
          ...prevData,
          pvdefaultimgid: prevData.pvdefaultimgid || response.data.data[0].productimgid,
          pictureNopIds: [
            ...prevData.pictureNopIds,
            ...response.data.data.map(img => img.productimgid)
          ],
          pvummappings: [
            ...prevData.pvummappings,
            ...response.data.data.map(img => ({
              pvumid: img.pvumid || 0,
              proid: prevData.proid,
              pvid: prevData.pvid,
              productimgid: img.productimgid
            }))
          ]
        };
        
        // Save to session storage
        saveFormDataToSessionStorage(updatedFormData);
        return updatedFormData;
      });

      // Clear pending images but keep the preview URLs in uploadedImages
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


// Updated handleRemoveImage function to handle removing uploaded images
const handleRemoveImage = (imageId) => {
  // Remove from uploadedImages
  setUploadedImages(prev => {
    const imageToRemove = prev.find(img => img.id === imageId);
    if (imageToRemove) {
      // Clean up the object URL if it's a blob URL
      if (imageToRemove.preview && imageToRemove.preview.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
    }
    return prev.filter(img => img.id !== imageId);
  });

  // Remove from imagePreviews
  setImagePreviews(prev => {
    const updatedImages = uploadedImages.filter(img => img.id !== imageId);
    return updatedImages.map(img => img.preview);
  });

  // Update formData
  setFormData(prevData => {
    const updatedFormData = {
      ...prevData,
      pictureNopIds: prevData.pictureNopIds.filter(id => id !== imageId),
      pvummappings: prevData.pvummappings.filter(mapping => mapping.productimgid !== imageId),
      // Update default image if the removed image was the default
      pvdefaultimgid: prevData.pvdefaultimgid === imageId 
        ? (prevData.pictureNopIds.find(id => id !== imageId) || '') 
        : prevData.pvdefaultimgid
    };
    
    saveFormDataToSessionStorage(updatedFormData);
    return updatedFormData;
  });
};

// Updated handleRemovePendingImage to properly clean up URLs
// const handleRemovePendingImage = (index) => {
//   setPendingImages(prev => {
//     const updated = [...prev];
//     // Clean up object URL to prevent memory leaks
//     if (updated[index].preview) {
//       URL.revokeObjectURL(updated[index].preview);
//     }
//     updated.splice(index, 1);
//     return updated;
//   });
// };

// Add this effect to clean up object URLs when component unmounts
useEffect(() => {
  return () => {
    // Clean up all pending image URLs on component unmount
    pendingImages.forEach(img => {
      if (img.preview && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview);
      }
    });
    
    // Clean up uploaded image URLs that are blob URLs
    uploadedImages.forEach(img => {
      if (img.preview && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview);
      }
    });
  };
}, []);

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

const handleSkuChange = async (newValue) => {
  if (!newValue) {
    setSkuValue(null);
    setIsSkuFetched(false);
    setFormData(prevData => ({
      ...prevData,
      proid: '',
      pvsku: '',
      provarianttaxes: [{
        ...prevData.provarianttaxes[0],
        proid: null
      }],
      pvamappings: prevData.pvamappings.map(mapping => ({
        ...mapping,
        proid: null
      })),
      pvummappings: prevData.pvummappings.map(mapping => ({
        ...mapping,
        proid: null
      }))
    }));
    setImagePreviews([]);
    setUploadedImages([]);
    return;
  }

  setSkuValue(newValue);

  if (!newValue.__isNew__) {
    try {
      reToast.loading("Fetching product details...");
      const response = await CallFor(
        `v2/Product/GetProductVariantBySku?sku=${encodeURIComponent(newValue.label)}`,
        "get",
        null,
        "Auth"
      );
      if (response.data && response.data.data) {
        reToast.dismiss();
        reToast.success("Product details fetched successfully. You can now edit price and inventory.");
        const apiData = response.data.data;

        // Handle image previews from pvummappings
        if (apiData.pvummappings && apiData.pvummappings.length > 0) {
          const imageUrls = apiData.pvummappings
            .filter(mapping => mapping.productimg && mapping.productimg.umurl)
            .map(mapping => ({
              id: mapping.productimg.umid,
              preview: `${process.env.NEXT_PUBLIC_VIEW_DOCUMENT}/${mapping.productimg.umurl}`,
              name: mapping.productimg.umname || 'Product Image'
            }));

          // Set uploaded images with the fetched URLs
          setUploadedImages(imageUrls);
          setImagePreviews(imageUrls.map(img => img.preview));
        }

        // Map API response to formData structure
        setFormData(prevData => ({
          ...prevData,
          ...apiData,
          pvname: apiData.pvname || '',
          pvdesc: apiData.pvdesc || '',
          shortdesc: apiData.shortdesc || '',
          pvbarcode: apiData.pvbarcode || '',
          pvsku: apiData.pvsku || '',
          pvdefaultimgid: apiData.pvdefaultimgid || '',
          pvstatus: apiData.pvstatus || 0,
          pvcurrencyid: apiData.pvcurrencyid || null,
          pvsalesprice: apiData.pvsalesprice || '',
          pvpurchaseprice: apiData.pvpurchaseprice || '',
          pvoldprice: apiData.pvoldprice || '',
          pvspecialprice: apiData.pvspecialprice || '',
          pvspstartdate: apiData.pvspstartdate || '',
          pvspenddate: apiData.pvspenddate || '',
          orgid: apiData.uoid || orgid,
          warehouseid: apiData.warhosueid || 70,
          autorenew: apiData.autoreniew || false,
          safetylevel: apiData.safetylevel || '',
          reorderlevel: apiData.reorderlevel || '',
          availabledate: apiData.availabledate || '',
          enddate: apiData.enddate || '',
          openingstock: apiData.openingstock || '',
          openingstockdate: apiData.openingstockdate || '',
          closingstock: apiData.closingstock || '',
          closingstockdate: apiData.closingstockdate || '',
          isinclusive: apiData.isinclusive || false,
          moq: apiData.moq || '',
          isPublished: apiData.isPublished || false,
          markAsNew: apiData.markAsNew || false,
          markAsNewStartDateTimeUtc: apiData.markAsNewStartDateTimeUtc || '',
          markAsNewEndDateTimeUtc: apiData.markAsNewEndDateTimeUtc || '',
          isdeleted: false,
          proid: apiData.proid || null,
          pictureNopIds: apiData.pictureNopIds || [],
          provarianttaxes: apiData.provarianttaxes || [],
          pvamappings: apiData.pvamappings || [],
          pvummappings: apiData.pvummappings || [],
          relatedProducts: apiData.relatedproducts || [],
          productcategorymappings: apiData.productcategorymappings || [],
          manufacturerid: apiData.pmanmappings && apiData.pmanmappings[0]?.manid ? apiData.pmanmappings[0].manid : null,
          prouom: apiData.prouom || null,
          adminComment: apiData.admincomment || '',
          sku: apiData.pvsku || '',
          taxExempt: apiData.taxExempt || false,
          taxCategory: apiData.taxCategory || ''
        }));
        // Set specifications and keywords
        setSpecifications(
          (apiData.specification || []).map(spec => ({
            attributeName: spec.attributename || '',
            attributeValues: (spec.attributevalues || []).map(v => v.avname).join(', ')
          }))
        );
        setKeywords((apiData.protags || []).join(', '));
        setSelectedCategories(
          (apiData.productcategorymappings || []).map(cat => ({
            value: cat.catid,
            label: categoryOptions.find(opt => opt.value === cat.catid)?.label || ''
          }))
        );
        setSelectedManufacturer(
          apiData.pmanmappings && apiData.pmanmappings[0]?.manid
            ? manufacturerOptions.find(opt => opt.value === apiData.pmanmappings[0].manid)
            : null
        );
        setSelectedUOM(
          apiData.prouom
            ? uomOptions.find(opt => opt.value === apiData.prouom)
            : null
        );
        setIsSkuFetched(true);
      }
    } catch (error) {
      reToast.error("Failed to fetch product by SKU");
      setIsSkuFetched(false);
    }
  } else {
    setIsSkuFetched(false);
    // ...existing logic for new SKU
    setFormData(prevData => ({
      ...prevData,
      proid: 0,
      pvsku: newValue.value,
      provarianttaxes: [{
        ...prevData.provarianttaxes[0],
        proid: 0
      }],
      pvamappings: prevData.pvamappings.map(mapping => ({
        ...mapping,
        proid: 0
      })),
      pvummappings: prevData.pvummappings.map(mapping => ({
        ...mapping,
        proid: 0
      }))
    }));
  }
};
  useEffect(() => {
    // Fetch attributes, SKUs, and currency options from your API
    const fetchOptions = async () => {
      try {
        const response = await CallFor("v2/Product/SaveProductvariant", "get", null, "Auth");
        const data = await response.data;
        setSkuOptions(data.dropdowns.sku.map(product => ({ value: product.key, label: product.value })));
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
    productValidation(name, value);
  };

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

  const validateRequiredFields = () => {
    const errors = {};
    
    // Basic Information validations
    if (!formData.pvname?.trim()) {
      errors.pvname = 'Product name is required';
    }
    if (!formData.pvdesc?.trim()) {
      errors.pvdesc = 'Description is required';
    }
    // if (!selectedCategories?.length) {
    //   errors.categories = 'At least one category is required';
    // }
    // if (!selectedManufacturer) {
    //   errors.manufacturer = 'Manufacturer is required';
    // }
    if (formData.markAsNew) {
      if (!formData.markAsNewStartDateTimeUtc) {
        errors.markAsNewStartDateTimeUtc = 'Mark as new start date is required';
      }
      if (!formData.markAsNewEndDateTimeUtc) {
        errors.markAsNewEndDateTimeUtc = 'Mark as new end date is required';
      }
    }

    // Pricing validations
    if (!formData.pvcurrencyid) {
      errors.pvcurrencyid = 'Currency is required';
    }
    if (!formData.pvsalesprice || formData.pvsalesprice <= 0) {
      errors.pvsalesprice = 'Valid sales price is required';
    }
    if (!formData.pvpurchaseprice || formData.pvpurchaseprice <= 0) {
      errors.pvpurchaseprice = 'Valid purchase price is required';
    }
    if (formData.pvspecialprice && formData.pvspecialprice > 0) {
      if (!formData.pvspstartdate) {
        errors.pvspstartdate = 'Special price start date is required';
      }
      if (!formData.pvspenddate) {
        errors.pvspenddate = 'Special price end date is required';
      }
    }

    // Tax validations
    const taxRate = formData.provarianttaxes?.[0]?.taxrate;
    if (taxRate !== null && taxRate !== undefined && 
        (isNaN(taxRate) || taxRate < 0 || taxRate > 100)) {
      errors.taxrate = 'Tax rate must be between 0 and 100';
    }

    // Inventory validations
    if (!formData.openingstock || formData.openingstock < 0) {
      errors.openingstock = 'Valid opening stock is required';
    }
    if (!formData.openingstockdate) {
      errors.openingstockdate = 'Opening stock date is required';
    }
    if (!formData.closingstock || formData.closingstock < 0) {
      errors.closingstock = 'Valid closing stock is required';
    }
    if (!formData.closingstockdate) {
      errors.closingstockdate = 'Closing stock date is required';
    }
    if (!formData.safetylevel || formData.safetylevel < 0) {
      errors.safetylevel = 'Valid safety level is required';
    }
    if (!formData.reorderlevel || formData.reorderlevel < 0) {
      errors.reorderlevel = 'Valid reorder level is required';
    }
    if (!formData.moq || formData.moq < 0) {
      errors.moq = 'Valid minimum order quantity is required';
    }

    // SKU validation
    if (!skuValue) {
      errors.sku = 'SKU is required';
    }

    // Image validation - only check if not fetched from SKU
    if (!isSkuFetched && !formData.pvdefaultimgid && !imageFiles.length && !uploadedImages.length) {
      errors.images = 'At least one product image is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateRequiredFields()) {
    // Combine all validation errors into a single message
    const errorMessages = Object.values(validationErrors).join(', ');
    reToast.error(errorMessages);
    return;
  }

  setIsSaving(true); // Set loading state to true
  
  try {
    if (isSkuFetched) {
      // Send SKU with inventory and pricing data
      const dataToSend = { 
        pvsku: formData.pvsku,
        // Inventory data
        openingstock: formData.openingstock,
        openingstockdate: formData.openingstockdate,
        closingstock: formData.closingstock,
        closingstockdate: formData.closingstockdate,
        safetylevel: formData.safetylevel,
        reorderlevel: formData.reorderlevel,
        allowBackInStockSubscriptions: formData.allowBackInStockSubscriptions,
        // Pricing data
        pvsalesprice: formData.pvsalesprice,
        pvpurchaseprice: formData.pvpurchaseprice,
        pvoldprice: formData.pvoldprice,
        pvspecialprice: formData.pvspecialprice,
        pvspstartdate: formData.pvspstartdate,
        pvspenddate: formData.pvspenddate,
        pvcurrencyid: formData.pvcurrencyid,
        // Tax data
        taxExempt: formData.taxExempt,
        taxCategory: formData.taxCategory,
        provarianttaxes: formData.provarianttaxes
      };
      const response = await CallFor(
        "v2/Product/SaveProductvariant",
        "post",
        JSON.stringify(dataToSend),
        "Auth"
      );
      if (response.data.status === true) {
        reToast.success("Product saved successfully!");
        router.push("/station/Catalogue/Products");
        sessionStorage.removeItem('productFormData');
        sessionStorage.removeItem('imagePreview');
      } else {
        reToast.error(response.data.message || "Failed to save product");
      }
      return;
    }

    if (!formData.pvdefaultimgid) {
      reToast.error("Please upload an image for the product.");
      return;
    }

    // Prepare keywords as array for Protags
    const Protags = keywords
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // Check if specifications have any actual content
    const hasValidSpecifications = specifications.some(spec => 
      spec.attributeName.trim() !== '' && 
      (Array.isArray(spec.attributeValues) 
        ? spec.attributeValues.length > 0 
        : typeof spec.attributeValues === 'string' 
          ? spec.attributeValues.trim() !== ''
          : false)
    );

    // Prepare specification data only if there are valid specifications
    const specification = hasValidSpecifications ? specifications.map(spec => ({
      attributeid: 0,
      attributename: spec.attributeName,
      description: spec.attributeName, // or another field if you want
      attributeicon: "string",
      attributecolor: "string",
      uoid: orgid,
      isspecification: true,
      attributevalues: Array.isArray(spec.attributeValues) 
        ? spec.attributeValues.map(val => ({
            avid: 0,
            attributeid: 0,
            avname: val.trim(),
            avdisplayorder: "string",
            uoid: orgid,
            avicon: "string",
            avcolor: "string",
            pvamvaluemodels: [{
              pvamvid: 0,
              pvamid: 0,
              avid: 0,
              pvamvcolor: "string",
              umid: 0,
              displayorder: 0
            }]
          }))
        : typeof spec.attributeValues === 'string'
          ? spec.attributeValues.split(',').map(val => ({
              avid: 0,
              attributeid: 0,
              avname: val.trim(),
              avdisplayorder: "string",
              uoid: orgid,
              avicon: "string",
              avcolor: "string",
              pvamvaluemodels: [{
                pvamvid: 0,
                pvamid: 0,
                avid: 0,
                pvamvcolor: "string",
                umid: 0,
                displayorder: 0
              }]
            }))
          : []
    })) : null;

    const dataToSend = {
      ...formData,
      proid: null,
      productcategorymappings: selectedCategories.map(cat => ({
        id: 0,
        proid: null,
        catid: cat.value
      })),
      manufacturerid: selectedManufacturer?.value || null,
      prouom: selectedUOM?.value || null,
      pictureNopIds: formData.pictureNopIds,
      specification,
      Protags,
      // ...other fields...
    };

    // Also ensure proid is null in all mappings
    dataToSend.pvamappings = (dataToSend.pvamappings || []).map(mapping => ({
      ...mapping,
      proid: null
    }));
    dataToSend.pvummappings = (dataToSend.pvummappings || []).filter(
      mapping => mapping.productimgid !== null && mapping.productimgid !== undefined
    );
    dataToSend.provarianttaxes = (dataToSend.provarianttaxes || []).map(tax => ({
      ...tax,
      proid: null
    }));

    // API call
    const response = await CallFor(
      "v2/Product/SaveProductvariant",
      "post",
      JSON.stringify(dataToSend),
      "Auth"
    );
    
    if (response.data.status == true) {
      reToast.success("Product saved successfully!");
      router.push("/station/Catalogue/Products");
      sessionStorage.removeItem('productFormData');
      sessionStorage.removeItem('imagePreview');
    }

  } catch (error) {
    console.error("Error:", error);
    reToast.error("Failed to save product");
  } finally {
    setIsSaving(false); // Reset loading state regardless of success/failure
  }
};

  const productValidation = (fieldName, value) => {
    let errors = { ...validationErrors };
    let newErrors = [];

    // Validate each field based on the fieldName parameter
    if (fieldName === 'pvname' || fieldName === undefined) {
      if (!formData.pvname && !value) {
        errors.pvname = 'Enter product name';
        newErrors.push('Enter product name');
      } else {
        delete errors.pvname;
      }
    }

    if (fieldName === 'pvdesc' || fieldName === undefined) {
      if (!formData.pvdesc && !value) {
        errors.pvdesc = 'Enter product description';
        newErrors.push('Enter product description');
      } else {
        delete errors.pvdesc;
      }
    }

    if (fieldName === 'pvsalesprice' || fieldName === undefined) {
      const price = value || formData.pvsalesprice;
      if (!price) {
        errors.pvsalesprice = 'Please enter a price';
        newErrors.push('Please enter a price');
      } else if (isNaN(price)) {
        errors.pvsalesprice = 'Price must be a number';
        newErrors.push('Price must be a number');
      } else {
        delete errors.pvsalesprice;
      }
    }

    if (fieldName === 'pvpurchaseprice' || fieldName === undefined) {
      if (!formData.pvpurchaseprice && !value) {
        errors.pvpurchaseprice = 'Enter purchase price';
        newErrors.push('Enter purchase price');
      } else {
        delete errors.pvpurchaseprice;
      }
    }

    if (fieldName === 'pvspecialprice' || fieldName === undefined) {
      if (formData.pvspecialprice && !formData.pvspstartdate) {
        errors.pvspstartdate = 'Select special price start date';
        newErrors.push('Select special price start date');
      } else {
        delete errors.pvspstartdate;
      }
      if (formData.pvspecialprice && !formData.pvspenddate) {
        errors.pvspenddate = 'Select special price end date';
        newErrors.push('Select special price end date');
      } else {
        delete errors.pvspenddate;
      }
    }

    if (fieldName === 'openingstock' || fieldName === undefined) {
      if (!formData.openingstock && !value) {
        errors.openingstock = 'Enter opening stock';
        newErrors.push('Enter opening stock');
      } else {
        delete errors.openingstock;
      }
    }

    if (fieldName === 'closingstock' || fieldName === undefined) {
      if (!formData.closingstock && !value) {
        errors.closingstock = 'Enter closing stock';
        newErrors.push('Enter closing stock');
      } else {
        delete errors.closingstock;
      }
    }

    if (fieldName === 'safetylevel' || fieldName === undefined) {
      if (!formData.safetylevel && !value) {
        errors.safetylevel = 'Enter safety level';
        newErrors.push('Enter safety level');
      } else {
        delete errors.safetylevel;
      }
    }

    if (fieldName === 'reorderlevel' || fieldName === undefined) {
      if (!formData.reorderlevel && !value) {
        errors.reorderlevel = 'Enter reorder level';
        newErrors.push('Enter reorder level');
      } else {
        delete errors.reorderlevel;
      }
    }

    if (fieldName === 'moq' || fieldName === undefined) {
      if (!formData.moq && !value) {
        errors.moq = 'Enter minimum order quantity';
        newErrors.push('Enter minimum order quantity');
      } else {
        delete errors.moq;
      }
    }

    setValidationErrors(errors);
    
    // Show all new errors in a single toast if there are any
    if (newErrors.length > 0) {
      reToast.error(newErrors.join(', '));
    }
    
    return Object.keys(errors).length === 0;
  }

 
console.log(validationErrors,"validastionerroer")

  // Add this function to handle canceling the SKU selection
  const handleCancelSku = () => {
    setIsSkuFetched(false);
    setSkuValue(null);
    setFormData({
      pvid: 0,
      proid: null,
      pvname: "",
      pvdesc: "",
      shortdesc: "",
      pvbarcode: "",
      pvsku: "",
      pvdefaultimgid: '',
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
      safetylevel: null,
      reorderlevel: null,
      availabledate: "",
      enddate: "",
      openingstock: "",
      openingstockdate: "",
      closingstock: "",
      closingstockdate: "",
      isinclusive: false,
      moq: null,
      isPublished: false,
      markAsNew: false,
      markAsNewStartDateTimeUtc: "",
      markAsNewEndDateTimeUtc: "",
      isdeleted: false,
      proid: null,
      pictureNopIds: [],
      provarianttaxes: [{
        protaxid: 0,
        isexempt: false,
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
        isrequired: false,
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
      relatedProducts: []
    });
    setSpecifications([{ attributeName: '', attributeValues: [] }]);
    setKeywords('');
    setSelectedCategories([]);
    setSelectedManufacturer(null);
    setSelectedUOM(null);
    setSelectedAttributes([{ name: null, value: null }]);
    setImageFiles([]);
    setImagePreviews([]);
    sessionStorage.removeItem('productFormData');
    sessionStorage.removeItem('imagePreview');
  };

  const RelatedProductsModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [localCheckedState, setLocalCheckedState] = useState({});

    useEffect(() => {
      // Initialize local state with values from formData
      const initialCheckedState = {};
      formData.relatedProducts.forEach(product => {
        initialCheckedState[product.relatedproid] = true;
      });
      setLocalCheckedState(initialCheckedState);
    }, [formData.relatedProducts]);

    const handleRelatedProductChange = (productId, isChecked) => {
      setLocalCheckedState(prevState => ({
        ...prevState,
        [productId]: isChecked
      }));
    };

    const handleDialogClose = () => {
      const newRelatedProducts = Object.entries(localCheckedState)
        .filter(([productId, isChecked]) => isChecked)
        .map(([productId]) => ({ ppmid: 0, pvid: 0, relatedproid: parseInt(productId) }));

      setFormData(prevData => ({
        ...prevData,
        relatedProducts: newRelatedProducts
      }));
      setIsOpen(false);
    };

    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) handleDialogClose();
        setIsOpen(open);
      }}>
        <DialogTrigger asChild>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setIsOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Related Products
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px] max-h-[500px] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select Related Products</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto pr-4">
            {skuOptions.map((product) => (
              <div key={product.value} className="flex items-center space-x-2 py-2 border-b border-gray-100">
                <Checkbox
                  id={`product-${product.value}`}
                  checked={localCheckedState[product.value] || false}
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
  };

  // Add auto-save effect
  useEffect(() => {
    saveFormDataToSessionStorage(formData);
  }, [
    formData,
    selectedCategories,
    selectedManufacturer,
    selectedUOM,
    specifications,
    keywords,
    selectedAttributes,
    skuValue,
    imagePreviews,
    formData.productcategorymappings,
    formData.manufacturerid,
    formData.prouom,
    formData.provarianttaxes,
    formData.pvamappings,
    formData.pvummappings,
    formData.relatedProducts
  ]);

  const handleReset = () => {
    // Clear session storage
    sessionStorage.removeItem('productFormData');
    sessionStorage.removeItem('imagePreviews');

    // Reset form data to initial state
    setFormData({
      pvid: 0,
      proid: null,
      pvname: "",
      pvdesc: "",
      shortdesc: "",
      pvbarcode: "",
      pvsku: "",
      pvdefaultimgid: '',
      pvstatus: 0,
      pvcurrencyid: null,
      pvsalesprice: "",
      pvpurchaseprice: "",
      pvoldprice: "",
      pvspecialprice: "",
      pvspstartdate: "",
      pvspenddate: "",
      orgid: orgid,
      warehouseid: uaid,
      autorenew: false,
      safetylevel: null,
      reorderlevel: null,
      availabledate: "",
      enddate: "",
      openingstock: "",
      openingstockdate: "",
      closingstock: "",
      closingstockdate: "",
      isinclusive: false,
      moq: null,
      isPublished: false,
      markAsNew: false,
      markAsNewStartDateTimeUtc: "",
      markAsNewEndDateTimeUtc: "",
      isdeleted: false,
      proid: null,
      pictureNopIds: [],
      provarianttaxes: [{
        protaxid: 0,
        isexempt: false,
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
        isrequired: false,
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
      relatedProducts: []
    });

    // Reset all other state
    setImagePreviews([]);
    setImageFiles([]);
    setSelectedCategories([]);
    setSelectedManufacturer(null);
    setSelectedUOM(null);
    setSpecifications([{ attributeName: '', attributeValues: [] }]);
    setKeywords('');
    setSelectedAttributes([{ name: null, value: null }]);
    setSkuValue(null);
    setIsSkuFetched(false);
    setValidationErrors({});

    // Clear file input if it exists
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Show success message
    reToast.success("Form has been reset successfully!");
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create a new product with detailed information. Fields marked with * are required.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Form
            </button>
          </div>
        </div>
        
        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-blue-700 font-semibold mb-2">Required Information</h3>
            <ul className="text-sm text-blue-600">
              <li>• Product Name</li>
              <li>• Category</li>
              <li>• SKU</li>
              <li>• Currency</li>
              <li>• Sales Price</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-green-700 font-semibold mb-2">Recommendations</h3>
            <ul className="text-sm text-green-600">
              <li>• Add clear product descriptions</li>
              <li>• Upload high-quality images</li>
              <li>• Set appropriate tax rates</li>
              <li>• Include specifications</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-purple-700 font-semibold mb-2">Optional Features</h3>
            <ul className="text-sm text-purple-600">
              <li>• Related products</li>
              <li>• Special pricing</li>
              <li>• Custom attributes</li>
              <li>• Keywords for search</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-orange-500">Basic Information</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Enter the fundamental details of your product.
            </p>
          </div>

          {/* First Row: SKU and Product Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SKU Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                SKU <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreatableSelect
                  isClearable
                  options={skuOptions}
                  value={skuValue}
                  onChange={handleSkuChange}
                  className={`text-black w-full ${validationErrors.sku ? 'border-red-500 ring-red-500' : ''}`}
                  placeholder="Select or type SKU"
                  formatCreateLabel={(inputValue) => `Use SKU: "${inputValue}"`}
                  isDisabled={isSkuFetched}
                />
                {isSkuFetched && (
                  <button
                    type="button"
                    onClick={handleCancelSku}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Cancel SKU
                  </button>
                )}
              </div>
              {validationErrors.sku && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.sku}</p>
              )}
            </div>

            {/* Product Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pvname"
                value={formData.pvname}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-md border ${
                  validationErrors.pvname ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={isSkuFetched && !editableWithSku.includes('pvname')}
              />
              {validationErrors.pvname && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.pvname}</p>
              )}
            </div>
          </div>

          {/* Second Row: Barcode, Manufacturer, UOM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                className={`w-full px-4 py-2 rounded-md border ${
                  validationErrors.pvbarcode ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={isSkuFetched && !editableWithSku.includes('pvbarcode')}
              />
              {validationErrors.pvbarcode && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.pvbarcode}</p>
              )}
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
                className={`${validationErrors.manufacturer ? 'border-red-500 ring-red-500' : ''}`}
                placeholder="Select manufacturer"
                isDisabled={isSkuFetched && !editableWithSku.includes('manufacturer')}
              />
              {validationErrors.manufacturer && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.manufacturer}</p>
              )}
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
                className={`${validationErrors.uom ? 'border-red-500 ring-red-500' : ''}`}
                placeholder="Select UOM"
                isDisabled={isSkuFetched && !editableWithSku.includes('uom')}
              />
              {validationErrors.uom && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.uom}</p>
              )}
            </div>
          </div>

          {/* Display Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isSkuFetched && !editableWithSku.includes('isPublished')}
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Published
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="showOnHomepage"
                  checked={formData.showOnHomepage}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isSkuFetched && !editableWithSku.includes('showOnHomepage')}
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Show on Homepage
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="markAsNew"
                  checked={formData.markAsNew}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isSkuFetched && !editableWithSku.includes('markAsNew')}
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Mark as New
                </label>
              </div>

              {formData.markAsNew && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mark as New Start Date
                    </label>
                    <input
                      type="datetime-local"
                      name="markAsNewStartDateTimeUtc"
                      value={formData.markAsNewStartDateTimeUtc}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-md border ${
                        validationErrors.markAsNewStartDateTimeUtc ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      disabled={isSkuFetched && !editableWithSku.includes('markAsNewStartDateTimeUtc')}
                    />
                    {validationErrors.markAsNewStartDateTimeUtc && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.markAsNewStartDateTimeUtc}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mark as New End Date
                    </label>
                    <input
                      type="datetime-local"
                      name="markAsNewEndDateTimeUtc"
                      value={formData.markAsNewEndDateTimeUtc}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-md border ${
                        validationErrors.markAsNewEndDateTimeUtc ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      disabled={isSkuFetched && !editableWithSku.includes('markAsNewEndDateTimeUtc')}
                    />
                    {validationErrors.markAsNewEndDateTimeUtc && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.markAsNewEndDateTimeUtc}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Availability Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Available Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="availabledate"
                value={formData.availabledate}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-md border ${
                  validationErrors.availabledate ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={isSkuFetched && !editableWithSku.includes('availabledate')}
              />
              {validationErrors.availabledate && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.availabledate}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Available End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="enddate"
                value={formData.enddate}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-md border ${
                  validationErrors.enddate ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={isSkuFetched && !editableWithSku.includes('enddate')}
              />
              {validationErrors.enddate && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.enddate}</p>
              )}
            </div>
          </div>

          {/* Third Row: Categories */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Categories <span className="text-red-500">*</span>
            </label>
            <Select
              isMulti
              options={categoryOptions}
              value={selectedCategories}
              onChange={handleCategoryChange}
              className={`${validationErrors.categories ? 'border-red-500 ring-red-500' : ''}`}
              placeholder="Select categories"
              isDisabled={isSkuFetched && !editableWithSku.includes('categories')}
            />
            {validationErrors.categories && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.categories}</p>
            )}
          </div>

          {/* Fourth Row: Description Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                name="pvdesc"
                value={formData.pvdesc}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSkuFetched && !editableWithSku.includes('pvdesc')}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Short Description
              </label>
              <textarea
                name="shortdesc"
                value={formData.shortdesc}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSkuFetched && !editableWithSku.includes('shortdesc')}
              />
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

          {/* First Row: Currency and Sales Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Currency <span className="text-red-500">*</span>
              </label>
              <Select
                options={currencyOptions}
                value={currencyOptions.find(option => option.value === formData.pvcurrencyid)}
                onChange={handleCurrencyChange}
                className={`${validationErrors.pvcurrencyid ? 'border-red-500 ring-red-500' : ''}`}
                isDisabled={isSkuFetched && !editableWithSku.includes('pvcurrencyid')}
              />
              {validationErrors.pvcurrencyid && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.pvcurrencyid}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sales Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pvsalesprice"
                value={formData.pvsalesprice}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-md border ${
                  validationErrors.pvsalesprice ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={isSkuFetched && !editableWithSku.includes('pvsalesprice')}
              />
              {validationErrors.pvsalesprice && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.pvsalesprice}</p>
              )}
            </div>
          </div>

          {/* Second Row: Purchase Price and Old Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Purchase Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pvpurchaseprice"
                value={formData.pvpurchaseprice}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-md border ${
                  validationErrors.pvpurchaseprice ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={isSkuFetched && !editableWithSku.includes('pvpurchaseprice')}
              />
              {validationErrors.pvpurchaseprice && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.pvpurchaseprice}</p>
              )}
            </div>

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
                disabled={isSkuFetched && !editableWithSku.includes('pvoldprice')}
              />
            </div>
          </div>

          {/* Special Pricing Section */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Special Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  disabled={isSkuFetched && !editableWithSku.includes('pvspecialprice')}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Special Price Period
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="datetime-local"
                    name="pvspstartdate"
                    value={formData.pvspstartdate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSkuFetched && !editableWithSku.includes('pvspstartdate')}
                  />
                  <input
                    type="datetime-local"
                    name="pvspenddate"
                    value={formData.pvspenddate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSkuFetched && !editableWithSku.includes('pvspenddate')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Information Section with enhanced UI */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-orange-500">Tax Information</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Configure tax settings for your product.
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isSkuFetched ? 'opacity-50' : ''}`}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tax Rate (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="taxrate"
                value={formData.provarianttaxes[0]?.taxrate || ''}
                onChange={(e) => {
                  const newFormData = {...formData};
                  newFormData.provarianttaxes[0] = {
                    ...newFormData.provarianttaxes[0],
                    taxrate: e.target.value
                  };
                  setFormData(newFormData);
                }}
                className={`w-full px-4 py-2 rounded-md border ${
                  validationErrors.taxrate ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={isSkuFetched}
              />
              {validationErrors.taxrate && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.taxrate}</p>
              )}
            </div>

          <div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    HSN Code
  </label>
  <input
    type="number"
    name="hsncode"
    value={formData.provarianttaxes[0]?.hsncode ?? ''}
    onChange={(e) => {
      const value = e.target.value ? parseInt(e.target.value) : null;
      const newFormData = { ...formData };
      newFormData.provarianttaxes[0] = {
        ...newFormData.provarianttaxes[0],
        hsncode: parseInt(value)
      };
      setFormData(newFormData);
    }}
    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    disabled={isSkuFetched}
    min="0"
    step="1"
  />
</div>
          </div>

          <div className={`flex items-center mt-4 space-x-2 ${isSkuFetched ? 'opacity-50' : ''}`}>
            <input
              type="checkbox"
              name="taxExempt"
              checked={formData.taxExempt}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={isSkuFetched}
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Tax Exempt
            </label>
          </div>
        </div>

        {/* Inventory Management Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-orange-500">Inventory Management</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Configure stock levels and inventory settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opening Stock */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Opening Stock <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <input
                  type="number"
                  name="openingstock"
                  value={formData.openingstock}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    validationErrors.openingstock ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isSkuFetched && !editableWithSku.includes('openingstock')}
                />
                <input
                  type="datetime-local"
                  name="openingstockdate"
                  value={formData.openingstockdate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    validationErrors.openingstockdate ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isSkuFetched && !editableWithSku.includes('openingstockdate')}
                />
              </div>
              {(validationErrors.openingstock || validationErrors.openingstockdate) && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.openingstock || validationErrors.openingstockdate}
                </p>
              )}
            </div>

            {/* Closing Stock */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Closing Stock <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <input
                  type="number"
                  name="closingstock"
                  value={formData.closingstock}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    validationErrors.closingstock ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isSkuFetched && !editableWithSku.includes('closingstock')}
                />
                <input
                  type="datetime-local"
                  name="closingstockdate"
                  value={formData.closingstockdate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    validationErrors.closingstockdate ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isSkuFetched && !editableWithSku.includes('closingstockdate')}
                />
              </div>
              {(validationErrors.closingstock || validationErrors.closingstockdate) && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.closingstock || validationErrors.closingstockdate}
                </p>
              )}
            </div>
          </div>

          {/* Stock Levels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Safety Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="safetylevel"
                value={formData.safetylevel}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-md border ${
                  validationErrors.safetylevel ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={isSkuFetched && !editableWithSku.includes('safetylevel')}
              />
              {validationErrors.safetylevel && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.safetylevel}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reorder Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="reorderlevel"
                value={formData.reorderlevel}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-md border ${
                  validationErrors.reorderlevel ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={isSkuFetched && !editableWithSku.includes('reorderlevel')}
              />
              {validationErrors.reorderlevel && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.reorderlevel}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Minimum Order Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="moq"
                value={formData.moq}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-md border ${
                  validationErrors.moq ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={isSkuFetched && !editableWithSku.includes('moq')}
              />
              {validationErrors.moq && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.moq}</p>
              )}
            </div>
          </div>

          {/* Additional Inventory Settings */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="autorenew"
                checked={formData.autorenew}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isSkuFetched && !editableWithSku.includes('autorenew')}
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Auto Renew Stock
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="allowBackInStockSubscriptions"
                checked={formData.allowBackInStockSubscriptions}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isSkuFetched && !editableWithSku.includes('allowBackInStockSubscriptions')}
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Allow Back In Stock Subscriptions
              </label>
            </div>
          </div>
        </div>

        {/* Product Attributes Section */}
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6 ${isSkuFetched ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-orange-500">Product Attributes</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Define product specifications and attributes.
            </p>
            {isSkuFetched && (
              <p className="text-sm text-red-500 mt-2">
                Product attributes cannot be modified when editing an existing SKU
              </p>
            )}
          </div>

          {/* Display Existing Attributes when SKU is selected */}
          {isSkuFetched && formData.pvamappings && formData.pvamappings.filter(mapping => !mapping.ispecification).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Existing Attributes
              </h3>
              <div className="space-y-4">
                {formData.pvamappings
                  .filter(mapping => !mapping.ispecification && mapping.pvamvalues && mapping.pvamvalues.length > 0)
                  .map((mapping, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center">
                        <span className="text-gray-900 dark:text-white">
                          {mapping.attrname} - {mapping.pvamvalues.map(val => val.avname).join(', ')}
                        </span>
                        {mapping.isrequired && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

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
                <Link href="/station/Catalogue/Products/addnewattribute">
                <button
                type="button"
              
                className="px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>Create Attribute</span>
              </button>
                </Link>
               
              
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
                    options={attributes.map(a => ({ value: a.id, label: a.name }))}
                    value={attr.name ? { value: attr.name, label: attributes.find(a => a.id === attr.name)?.name } : null}
                    onChange={(selected) => handleAttributeChange(index, 'name', selected?.value)}
                    className="text-black"
                    placeholder="Select attribute"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Values
                  </label>
                  <div className="flex space-x-2">
                    <Select
                      isMulti
                      options={attributes.find(a => a.id === attr.name)?.values || []}
                      value={attr.values}
                      onChange={(selected) => handleAttributeChange(index, 'values', selected)}
                      className="text-black flex-1"
                      placeholder="Select values"
                    />
                    {selectedAttributes.length > 1 && (
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

          {/* Keywords/Tags */}
          <div className="mt-8 space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Keywords/Tags (comma-separated)
            </label>
            <textarea
              value={keywords}
              onChange={handleProVariantsChange}
              rows={3}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter keywords separated by commas"
            />
            <p className="text-sm text-gray-500">
              Add search keywords to help customers find this product
            </p>
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
            {!isSkuFetched && (
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
            )}

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

            {/* Uploaded Images */}
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
                      {!isSkuFetched && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(image.id)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
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

            {validationErrors.images && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.images}</p>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6 ${isSkuFetched ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-orange-500">Related Products</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Link this product to other related items to increase cross-selling opportunities.
            </p>
            {isSkuFetched && (
              <p className="text-sm text-red-500 mt-2">
                Related products cannot be modified when editing an existing SKU
              </p>
            )}
          </div>

          <div className="space-y-4">
            {/* Add Related Products Button */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Selected Related Products
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formData.relatedProducts.length} products selected
                </p>
              </div>
              <RelatedProductsModal />
            </div>

            {/* Selected Products List */}
            {formData.relatedProducts.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.relatedProducts.map((product) => {
                  const productDetails = skuOptions.find(opt => opt.value === product.relatedproid);
                  return (
                    <div
                      key={product.relatedproid}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {productDetails?.label || 'Unknown Product'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRelatedProductChange(product.relatedproid, false)}
                        className="p-1 text-red-500 hover:text-red-600 focus:outline-none"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {formData.relatedProducts.length === 0 && (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-gray-400 mb-2">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No related products selected
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Click the button above to add related products
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button Section */}
       {/* Submit Button Section */}
<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
  <div className="flex items-center justify-between">
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Ready to Save?
      </h3>
      <p className="text-sm text-gray-500">
        Please review all information before saving the product.
      </p>
    </div>
    <div className="flex space-x-4">
      <button
        type="button"
        onClick={handleReset}
        disabled={isSaving}
        className={`px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center space-x-2 ${
          isSaving ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>Reset Form</span>
      </button>
      <button
        type="submit"
        disabled={isSaving}
        className={`px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center space-x-2 ${
          isSaving ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSaving ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Saving...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Save Product</span>
          </>
        )}
      </button>
    </div>
  </div>
</div>
      </form>
    </div>
  );
}

export default ProductForm;

