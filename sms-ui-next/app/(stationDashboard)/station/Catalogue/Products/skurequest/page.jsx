"use client";
import CallFor from "@/utilities/CallFor";
import CallFor2 from "@/utilities/CallFor2";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { toast as reToast } from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [ManufacturerDropDown, setManufacturerDropDown] = useState([]);
  const [Manufacturerid, setManufacturerid] = useState(null);
  const [uomOptions, setUomOptions] = useState([]);
  const [specifications, setSpecifications] = useState([{ attributeName: "", attributeValues: [""] }]);
  const [proVariants, setProVariants] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [pictureNopIds, setPictureNopIds] = useState([]);
  const [prowatermarkid, setProwatermarkid] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    categories: [],
    description: "",
    keywords: "",
    price: "",
    prouom: null,
  });
  const [validationErrors, setValidationErrors] = useState({});
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const Uid = userData.uid;
  const orgid = userData.orgid;

  const validateForm = (fieldName, value) => {
    let errors = { ...validationErrors };

    if (fieldName === 'name' || fieldName === undefined) {
      if (!formData.name && !value) {
        errors.name = 'Please enter a product name.';
      } else {
        delete errors.name;
      }
    }

    if (fieldName === 'categories' || fieldName === undefined) {
      if (!formData.categories || formData.categories.length === 0) {
        errors.categories = 'Please select at least one category.';
      } else {
        delete errors.categories;
      }
    }

    if (fieldName === 'price' || fieldName === undefined) {
      const price = value || formData.price;
      if (!price) {
        errors.price = 'Please enter a price.';
      } else if (isNaN(price)) {
        errors.price = 'Price must be a number.';
      } else {
        delete errors.price;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (validateForm()) {
        const productData = {
          proid: 0,
          proname: formData.name,
          proconfig: null,
          prodescription: formData.description,
          shortdescription: formData.description,
          protype: true,
          proisactive: true,
          prouom: formData.prouom.value,
          proisfa: false,
          proorigin: 1,
          prodisplayinweb: true,
          expiryfrom: 0,
          ispurchasable: true,
          manufacturerid: Manufacturerid?.value,
          prowatermarkid: prowatermarkid,
          uoid: orgid,
          catid: 50,
          price: parseFloat(formData.price) || 0,
          specification: specifications.map(spec => ({
            attributename: spec.attributeName,
            attributevalues: spec.attributeValues.map(value => ({
              avname: value,
            })),
          })),
          protags: proVariants,
          productcategorymappings: formData.categories.map(category => ({
            id: 0,
            proid: null,
            catid: category.value
          })),
          pictureNopIds: pictureNopIds,
        };

        console.log("Submitting product data:", productData);

        try {
          const response = await CallFor(
            "v2/Product/SaveProduct",
            "POST",
            productData,
            "Auth"
          );

          if (response.status !== 200) {
            throw new Error("Network response was not ok");
          }

          const result = response.data;
          console.log("Product saved successfully:", result);
          reToast.success("SKU request sent successfully!");

          // Reset form
          setFormData({
            name: "",
            categories: [],
            description: "",
            keywords: "",
            price: "",
            prouom: null,
          });
          setSpecifications([{ attributeName: "", attributeValues: [""] }]);
          setProVariants([]);
          setImageFiles([]);
          setImagePreview([]);
          setPictureNopIds([]);
          router.push("/station/Catalogue/Products/productadd");
        } catch (error) {
          console.error("Error saving product:", error);
          reToast.error("Failed to send SKU request");
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
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

  useEffect(() => {
    GetDropDown();
  }, []);

  // useEffect(() => {
  //   if (formData.categories.length > 0) {
  //     const firstCategoryId = formData.categories[0].value;
  //     fetchUOM(firstCategoryId);
  //   } else {
  //     setUomOptions([]);
  //     setFormData(prevData => ({ ...prevData, prouom: null }));
  //   }
  // }, [formData.categories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateForm(name, value);
  };

  const handleSelectChange = (name, value) => {
    if (name === 'categories') {
      setFormData(prevData => ({ ...prevData, [name]: value || [] }));
      setValidationErrors(prevErrors => {
        const { categories, ...rest } = prevErrors; // Remove docimage from errors
        return rest;
      });
    } 
    else {
      setFormData(prevData => ({ ...prevData, [name]: value }));
    }
    if (name === 'Manufactures') {
      setManufacturerid(value);
      setValidationErrors(prevErrors => {
        const { Manufactures, ...rest } = prevErrors; // Remove docimage from errors
        return rest;
      });
    }
    else if (name === 'prouom') {
      setValidationErrors(prevErrors => {
        const { prouom, ...rest } = prevErrors; // Remove docimage from errors
        return rest;
      });
    }
    // validateForm(name, value);
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(prevFiles => [...prevFiles, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreview(prevPreviews => [...prevPreviews, ...newPreviews]);

      for (const file of files) {
        // Upload to first API (original) - for prowatermarkid
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
            throw new Error("Image upload failed to first API");
          }
          
          // Set the prowatermarkid from the first image upload response
          if (imageResponse.data) {
            setProwatermarkid(imageResponse.data);
          }
        } catch (error) {
          console.error("Error uploading image to first API:", error);
          reToast.error("Failed to upload image to first API");
        }

        // Upload to second API - for pictureNopIds array
        const formData = new FormData();
        formData.append('picturefile', file);

        try {
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
          console.error('Error uploading picture to second API:', error);
          reToast.error('Failed to upload image to second API');
        }
      }
    }
  };

  const handleImageRemove = (index) => {
    setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setImagePreview(prevPreviews => prevPreviews.filter((_, i) => i !== index));
    setPictureNopIds(prevIds => prevIds.filter((_, i) => i !== index));
  };

  const handleProVariantsChange = (e) => {
    const variantsArray = e.target.value
      .split(",")
      .map((variant) => variant.trim())
      .filter((variant) => variant);
    setProVariants(variantsArray);
    setFormData({ ...formData, provariants: e.target.value });
  };

  const handleProVariantRemove = (index) => {
    const updatedVariants = proVariants.filter((_, i) => i !== index);
    setProVariants(updatedVariants);
    setFormData({ ...formData, provariants: updatedVariants.join(", ") });
  };

  const handleSpecificationChange = (index, name, value) => {
    const updatedSpecifications = [...specifications];
    if (name === "attributeName") {
      updatedSpecifications[index].attributeName = value;
    } else if (name === "attributeValues") {
      updatedSpecifications[index].attributeValues = value.split(",").map(v => v.trim());
    }
    setSpecifications(updatedSpecifications);
  };

  const handleAddSpecification = (e) => {
    e.preventDefault();
    setSpecifications([...specifications, { attributeName: "", attributeValues: [""] }]);
  };

  const handleRemoveSpecification = (index, e) => {
    e.preventDefault();
    const updatedSpecifications = [...specifications];
    updatedSpecifications.splice(index, 1);
    setSpecifications(updatedSpecifications);
  };


  return (
    <div className="p-6 rounded-lg space-y-4">
      <h2 className="text-3xl mb-5 font-bold text-orange-500">
        Add SKU Request
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-3/4 p-2 border ${validationErrors.name ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300`}
            />
          </div>
          {validationErrors.name && (
            <div className="flex items-center space-x-4">
              <label className="w-1/4 text-sm font-medium"></label>
              <div className="text-red-500 text-sm">
                {validationErrors.name}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium">Categories</label>
            <Select
              isMulti
              value={formData.categories}
              onChange={(value) => handleSelectChange("categories", value)}
              options={categoryOptions}
              className={`w-3/4 text-black ${validationErrors.categories ? "border border-red-500" : ""}`}
            />
          </div>
          {validationErrors.categories && (
            <div className="flex items-center space-x-4">
              <label className="w-1/4 text-sm font-medium"></label>
              <div className="text-red-500 text-sm">
                {validationErrors.categories}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium ">Manufactures</label>
            <Select
              id="Manufactures"
              name="Manufactures"
              value={Manufacturerid}
              onChange={(value) => handleSelectChange("Manufactures", value)}
              options={ManufacturerDropDown}
              className="w-3/4 text-black" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-3/4 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center space-y-2">
            <label className="w-1/4 text-sm font-medium">Image</label>
            <div className="w-3/4 pl-2 flex items-center flex-wrap gap-4">
              {imageFiles.length === 0 ? (
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
              ) : (
                imageFiles.map((file, index) => (
                  <div key={index} className="relative h-36 rounded-xl">
                    <img
                      src={imagePreview[index]}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full border border-gray-300 rounded-md shadow-sm"
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
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium">Unit of Measure</label>
            <Select
              value={formData.prouom}
              onChange={(value) => handleSelectChange("prouom", value)}
              options={uomOptions}
              isDisabled={uomOptions.length === 0}
              className="w-3/4 text-black"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium">Price</label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className={`w-3/4 p-2 border ${validationErrors.price ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300`}
          />
        </div>
        {validationErrors.price && (
          <div className="flex items-center space-x-4">
            <label className="w-1/4 text-sm font-medium"></label>
            <div className="text-red-500 text-sm">
              {validationErrors.price}
            </div>
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
                      name="attributeName"
                      type="text"
                      value={spec.attributeName}
                      onChange={(e) =>
                        handleSpecificationChange(index, "attributeName", e.target.value)
                      }
                      className="mt-1"
                      placeholder="Attribute name"
                    />
                  </div>
                  <div>
                    <Input
                      name="attributeValues"
                      type="text"
                      value={spec.attributeValues.join(", ")}
                      onChange={(e) =>
                        handleSpecificationChange(index, "attributeValues", e.target.value)
                      }
                      className="mt-1"
                      placeholder="Attribute values (comma-separated)"
                    />
                  </div>
                </div>
                {index !== 0 && (
                  <Button
                    type="button"
                    onClick={(e) => handleRemoveSpecification(index, e)}
                    className="absolute top-2 -right-5 mt-1 mr-2 rounded-full px-[5px] h-4 bg-red-500 text-white"
                  >
                    x
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              onClick={handleAddSpecification}
              className="absolute -bottom-2 left-0 mt-4 h-4 rounded px-1 bg-blue-500 text-white"
            >
              +
            </Button>
          </div>
        </div>


        <div className="flex items-center space-x-4">
          <label className="w-1/4 text-sm font-medium">Keywords</label>
          <input
            type="text"
            name="provariants"
            value={formData.provariants}
            onChange={handleProVariantsChange}
            className="w-3/4 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="flex items-center space-x-4 ">
          <label className="w-1/4 text-sm font-medium"></label>
          <div className="flex flex-wrap gap-2 w-3/4">
            {proVariants.map((variant, index) => (
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
          <Link href={"/station/Catalogue/Requests"}>
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
            Send SKU Request
          </button>
        </div>
      </form>
    </div>
  );
}