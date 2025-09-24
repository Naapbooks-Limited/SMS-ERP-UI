"use client";
import CallFor from "@/utilities/CallFor";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { toast as reToast } from "react-hot-toast";
import * as Yup from "yup";
import { useForm } from 'react-hook-form';
import CallFor2 from "@/utilities/CallFor2";

export default function Page({ params }) {
  const router = useRouter();
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [ManufacturerDropDown, setManufacturerDropDown] = useState([]);
  const [Manufacturerid, setManufacturerid] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [proTags, setProTags] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMeasure, setSelectedMeasure] = useState({ value: '', label: '' });
  const [errorMsg, setErrorMsg] = useState(null);
  const [pictureNopIds, setPictureNopIds] = useState([]);
  const [prowatermarkid, setProwatermarkid] = useState(null);

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const Uid = userData.uid;

  const [formData, setFormData] = useState({
    proid: '',
    proname: '',
    proconfig: '',
    prodescription: '',
    shortdescription: '',
    protype: '',
    proisactive: '',
    prouom: '',
    prouomName: '',
    proisfa: '',
    proorigin: '',
    prooriginName: '',
    prodisplayinweb: '',
    prowatermarkid: '',
    imgurl: '',
    manufacturer: '',
    price: '',
    createdby: '',
    creator: '',
    uoid: '',
    orgName: '',
    expiryfrom: '',
    ispurchasable: '',
    catid: '',
    catName: '',
    isapproved: '',
    skuStatus: '',
    skuStatusName: '',
    provariants: [],
    specification: [],
    protags: [],
    pmanmappings: [],
    productcategorymappings: []
  });
  const [validationErrors, setValidationErrors] = useState({});
  const { handleSubmit, formState: { errors }, setError, clearErrors } = useForm();

  const validationSchema = Yup.object().shape({
    proname: Yup.string().required("Name is required"),
    selectedCategories: Yup.array().min(1, "At least one category is required"),
    prodescription: Yup.string().required("Description is required"),
    price: Yup.string().required("Price is required"),
    selectedMeasure: Yup.object().required("Unit of Measure is required"),
  });

  useEffect(() => {
    const fetchData = async () => {
      await GetDropDown();
      // await fetchProductData();
    };
    fetchData();
  }, [params.Proid]);

  useEffect(()=>{
    fetchProductData()
  },[categoryOptions])

  const fetchProductData = async () => {
    try {
      const response = await CallFor(
        `v2/Product/GetProductByID?Proid=${params.proid}`,
        "get",
        null,
        "Auth"
      );

      if (response && response.data) {
        const productData = response.data.data;
        setFormData(productData);
        setSelectedCategories(productData.productcategorymappings.map(mapping => ({
          value: mapping.catid,
          label: categoryOptions.find(cat => cat.value == mapping.catid)?.label || '',
        })));

        setProTags(productData.protags);
        setManufacturerid({ value: productData.manufacturer, label: productData.manufacturer });
        setSelectedMeasure({ value: productData.prouom, label: productData.prouomname });
        setProwatermarkid(productData.prowatermarkid);

        if (categoryOptions.length > 0) {
          setSelectedCategories(productData.productcategorymappings.map(mapping => {
            const category = categoryOptions.find(cat => cat.value === mapping.catid);
            return category ? { value: category.value, label: category.label } : null;
          }).filter(Boolean));
        }
        
        if (productData.specification) {
          setSpecifications(productData.specification);
        }

        // Handle image preview as an array
        if (productData.prowatermarkUmUrl) {
          setImagePreview([`${process.env.NEXT_PUBLIC_VIEW_DOCUMENT}${productData.prowatermarkUmUrl}`]);
        }
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
      setErrorMsg(error.message);
    }
  };

  const GetDropDown = async () => {
    try {
      const response = await CallFor(
        `v2/Product/SaveProduct`,
        "get",
        null,
        "Auth"
      );
      setManufacturerDropDown(
        response.data.dropdowns.manufacturer.map((product) => ({
          value: product.id,
          label: product.name,
        }))
      );
      if (response) {
        const options = response.data.dropdowns.categories.map((category) => ({
          value: category.id,
          label: category.name,
        }));
        setCategoryOptions(options);

        // Set UOM options from the API response
        const uomOptions = response.data.dropdowns.uoms.map((uom) => ({
          value: uom.id,
          label: uom.name,
        }));
        setUomOptions(uomOptions);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevProduct => ({
      ...prevProduct,
      [name]: value
    }));
    setValidationErrors((errors) => ({ ...errors, [name]: "" }));
  };

  const handleSelectChange = (name, value) => {
    if (name === 'category') {
      setSelectedCategories(value);
      setFormData(prevProduct => ({
        ...prevProduct,
        productcategorymappings: value.map(category => ({
          id: 0,
          proid: params.proid,
          catid: category.value
        }))
      }));
    }
    else if (name === "prouom") {
      setSelectedMeasure(value);
      setFormData(prevProduct => ({
        ...prevProduct,
        prouom: value.value,
        prouomName: value.label
      }));
    } else if (name === "Manufacturer") {
      setManufacturerid(value);
      setFormData(prevProduct => ({
        ...prevProduct,
        manufacturer: value.value,
      }));
    }
    setValidationErrors((errors) => ({ ...errors, [name]: "" }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(prevFiles => [...prevFiles, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreview(newPreviews);

      for (const file of files) {
        // Upload to first API for prowatermarkid
        const imageFormData = new FormData();
        imageFormData.append("Umurl", file);
        imageFormData.append("Uid", Uid);
        imageFormData.append("Umid", 0);
        imageFormData.append("Umname", file.name);
        imageFormData.append("Umalttext", "aa");
        imageFormData.append("Umsizes", file.size);
        imageFormData.append("Umbytes", file.size);
        imageFormData.append("Umextenstion", file.name.split(".").pop());
        imageFormData.append("Umtype", 2);

        try {
          const imageResponse = await CallFor(
            "v2/Product/SaveProductImages",
            "POST",
            imageFormData,
            "authWithContentTypeMultipart"
          );

          if (imageResponse.status !== 200) {
            throw new Error("Image upload failed");
          }

          if (imageResponse.data) {
            setProwatermarkid(imageResponse.data);
            setFormData(prevData => ({
              ...prevData,
              prowatermarkid: imageResponse.data
            }));
          }

          // Upload to second API for pictureNopIds
          const formData = new FormData();
          formData.append('picturefile', file);

          const response = await CallFor2(
            'api-fe/Account/UploadPicture',
            'post',
            formData,
            'authWithContentTypeMultipart'
          );

          if (response.data) {
            setPictureNopIds(prevIds => [...prevIds, response.data.Data.PictureId]);
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          reToast.error("Failed to upload image");
        }
      }
    }
  };

  const handleImageRemove = (index) => {
    setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setImagePreview(prevPreviews => prevPreviews.filter((_, i) => i !== index));
    setPictureNopIds(prevIds => prevIds.filter((_, i) => i !== index));
    
    if (imagePreview.length === 1) {
      setProwatermarkid(null);
      setFormData(prevData => ({
        ...prevData,
        prowatermarkid: null
      }));
    }
  };

  const handleProVariantsChange = (e) => {
    const variantsArray = e.target.value
      .split(",")
      .map((variant) => variant.trim())
      .filter((variant) => variant);
    setProTags(variantsArray);
  };

  const handleProVariantRemove = (index) => {
    const updatedprotags = proTags?.filter((_, i) => i !== index);
    setProTags(updatedprotags);
  };

  const handleSpecificationChange = (index, name, value) => {
    const updatedSpecifications = [...specifications];
    
    if (name === "attributename") {
      updatedSpecifications[index] = {
        ...updatedSpecifications[index],
        attributename: value
      };
    } else if (name === "attributevalues") {
      const values = value.split(",").map(v => v.trim()).filter(Boolean);
      
      // If it's an existing specification, maintain IDs
      if (updatedSpecifications[index].attributeid) {
        updatedSpecifications[index].attributevalues = values.map((val, i) => {
          const existingValue = updatedSpecifications[index].attributevalues[i];
          return existingValue ? {
            ...existingValue,
            avname: val
          } : {
            avid: null,
            attributeid: updatedSpecifications[index].attributeid,
            avname: val,
            avdisplayorder: null,
            uoid: null,
            avicon: null,
            avcolor: null,
            pvamvaluemodels: null
          };
        });
      } else {
        // For new specifications
        updatedSpecifications[index].attributevalues = values.map(val => ({
          avid: null,
          attributeid: null,
          avname: val,
          avdisplayorder: null,
          uoid: null,
          avicon: null,
          avcolor: null,
          pvamvaluemodels: null
        }));
      }
    }
    
    setSpecifications(updatedSpecifications);
  };

  const handleAddSpecification = () => {
    setSpecifications([
      ...specifications,
      {
        attributeid: null,
        attributename: "",
        description: null,
        attributeicon: null,
        attributecolor: null,
        uoid: userData.uoid,
        isspecification: true,
        attributevalues: []
      }
    ]);
  };

  const handleRemoveSpecification = (index) => {
    const updatedSpecifications = [...specifications];
    updatedSpecifications.splice(index, 1);
    setSpecifications(updatedSpecifications);
  };

  const handleSubmitHandler = async (event) => {

    try {
      const productData = {
        proid: params.proid,
        proname: formData.proname,
        proconfig: formData.proconfig,
        prodescription: formData.prodescription,
        shortdescription: formData.shortdescription,
        protype: formData.protype,
        proisactive: formData.proisactive,
        prouom: selectedMeasure.value,
        proisfa: formData.proisfa,
        proorigin: formData.proorigin,
        prodisplayinweb: formData.prodisplayinweb,
        prowatermarkid: prowatermarkid || formData.prowatermarkid,
        manufacturer: Manufacturerid?.value,
        price: parseFloat(formData.price) || 0,
        uoid: formData.uoid,
        expiryfrom: formData.expiryfrom,
        ispurchasable: formData.ispurchasable,
        catid: formData.catid,
        specification: specifications.map(spec => ({
          attributeid: spec.attributeid,
          attributename: spec.attributename,
          description: null,
          attributeicon: null,
          attributecolor: null,
          uoid: userData.uoid,
          isspecification: true,
          attributevalues: spec.attributevalues
        })),
        protags: proTags,
        productcategorymappings: selectedCategories.map(category => ({
          id: 0,
          proid: params.proid,
          catid: category.value
        })),
        pictureNopIds: pictureNopIds,
      };

      const response = await CallFor(
        "v2/Product/UpdateProduct",
        "POST",
        productData,
        "Auth"
      );

      if (response.status === 200) {
        reToast.success("SKU request updated successfully!");
        router.push("/station/Catalogue/Requests");
      } else {
        throw new Error("Failed to update SKU request");
      }
    } catch (error) {
      console.error("Error updating SKU request:", error);
      reToast.error("Failed to update SKU request");
    }
  };

  return (
    <div className="p-6 rounded-lg space-y-4">
      <h2 className="text-3xl mb-5 font-bold text-orange-500">
        Edit SKU Request
      </h2>
      <form onSubmit={handleSubmit(handleSubmitHandler)} className="space-y-4">
        <div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium">Name</label>
            <input
              type="text"
              name="proname"
              value={formData.proname}
              onChange={handleInputChange}
              className={`w-3/4 p-2 border ${validationErrors.proname ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300`}
            />
          </div>
          {validationErrors.proname && (
            <div className="flex items-center space-x-4">
              <label className="w-1/4 text-sm font-medium"></label>
              <div className="text-red-500 text-sm">{validationErrors.proname}</div>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium">Categories</label>
            <Select
              isMulti
              value={selectedCategories}
              onChange={(value) => handleSelectChange('category', value)}
              options={categoryOptions}
              className={`w-3/4 text-black ${validationErrors.selectedCategories ? "border-red-500" : ""}`}
            />
          </div>
          {validationErrors.selectedCategories && (
            <div className="flex items-center space-x-4">
              <label className="w-1/4 text-sm font-medium"></label>
              <div className="text-red-500 text-sm">{validationErrors.selectedCategories}</div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium">Manufacturer</label>
          <Select
            id="manufacturer"
            name="manufacturer"
            value={Manufacturerid}
            onChange={(value) => handleSelectChange('Manufacturer', value)}
            options={ManufacturerDropDown} className="w-3/4 mt-1 text-black block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium">Description</label>
            <textarea
              name="prodescription"
              value={formData.prodescription}
              onChange={handleInputChange}
              className={`w-3/4 p-2 border ${validationErrors.prodescription ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300`}
            />
          </div>
          {validationErrors.prodescription && (
            <div className="flex items-center space-x-4">
              <label className="w-1/4 text-sm font-medium"></label>
              <div className="text-red-500 text-sm">{validationErrors.prodescription}</div>
            </div>
          )}
        </div>

        <div className="flex items-center space-y-2">
          <label className="w-1/4 text-sm font-medium">Image</label>
          <div className="w-3/4 pl-2 flex items-center flex-wrap gap-4">
            {imagePreview.length > 0 ? (
              imagePreview.map((preview, index) => (
                <div key={index} className="relative h-36 rounded-xl">
                  <img
                    src={preview}
                    alt={`Image Preview ${index + 1}`}
                    className="w-full h-full border border-gray-300 rounded-md shadow-sm"
                    name='productimg'
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-sm border border-white focus:outline-none"
                  >
                    &times;
                  </button>
                </div>
              ))
            ) : (
              <Label>
                <Button asChild>
                  <div>
                    <Upload className="mr-2 h-4 w-4" /> Choose File
                  </div>
                </Button>
                <Input
                  type="file"
                  className="hidden"
                  onChange={handleImageChange}
                  multiple
                />
              </Label>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium">Unit of Measure</label>
            <Select
              value={selectedMeasure}
              onChange={(value) => handleSelectChange('prouom', value)}
              options={uomOptions}
              className={`w-3/4 text-black ${validationErrors.selectedMeasure ? "border-red-500" : ""}`}
            />
          </div>
          {validationErrors.selectedMeasure && (
            <div className="flex items-center space-x-4">
              <label className="w-1/4 text-sm font-medium"></label>
              <div className="text-red-500 text-sm">{validationErrors.selectedMeasure}</div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium">Price</label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className={`w-3/4 p-2 border ${validationErrors.price ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300`}
          />
        </div>
        {validationErrors?.price && (
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium"></label>
            <div className="text-red-500 text-sm">{validationErrors?.price}</div>
          </div>
        )}
        <div className="flex space-x-4 pb-3">
          <Label className="w-1/4 text-sm pt-2 font-medium">Specifications</Label>
          <div className="w-3/4 relative">
            {specifications.map((spec, index) => (
              <div key={index} className="mb-4 pr-3 relative">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="text"
                      value={spec.attributename || ''}
                      onChange={(e) =>
                        handleSpecificationChange(index, "attributename", e.target.value)
                      }
                      className="mt-1"
                      placeholder="Attribute name"
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      value={spec.attributevalues?.map(av => av.avname).join(", ") || ''}
                      onChange={(e) =>
                        handleSpecificationChange(index, "attributevalues", e.target.value)
                      }
                      className="mt-1"
                      placeholder="Attribute values (comma-separated)"
                    />
                  </div>
                </div>
                {/* <button
                  type="button"
                  onClick={() => handleRemoveSpecification(index)}
                  className="absolute -right-2 -top-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  ×
                </button> */}
              </div>
            ))}
            {/* <Button 
              type="button"
              onClick={handleAddSpecification}
              className="mt-2"
            >
              Add Specification
            </Button> */}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium">Keywords</label>
          <input
            type="text"
            name="provariants"
            value={proTags.join(", ")}
            onChange={handleProVariantsChange}
            className="w-3/4 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="flex items-center space-x-4 ">
          <label className="w-1/4 text-sm font-medium"></label>
          <div className="flex flex-wrap gap-2 w-3/4">
            {proTags?.map((variant, index) => (
              <div
                key={index}
                className="flex items-center dark:text-black font-semibold bg-gray-200 p-2 rounded-md"
              >
                <span>{variant}</span>
                <button
                  type="button"
                  onClick={() => handleProVariantRemove(index)}
                  className="ml-2 text-red-500"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <Link href={"/station/Catalogue/Requests/"}>
            <button
              type="button"
              className="px-3 py-2 bg-[#11357C] text-white rounded-md focus:outline-none"
            >
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            className="px-3 py-2 bg-orange-500 text-white rounded-md focus:outline-none"
          >
            Update SKU Request
          </button>
        </div>
      </form>
    </div>
  );
}

