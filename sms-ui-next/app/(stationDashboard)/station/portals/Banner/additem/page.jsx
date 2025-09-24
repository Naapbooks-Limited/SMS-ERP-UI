"use client"
import React, { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import CallFor2 from "@/utilities/CallFor2";
import { useRouter } from "next/navigation";

// Shared Tailwind CSS classes
const inputClasses = 'mt-1 block w-full border border-border rounded-md p-2';
const buttonClasses = 'px-4 py-2 rounded';
const imageClasses = 'w-16 h-16 border border-border rounded-md mr-2';
const labelClasses = 'block text-sm font-medium text-muted-foreground mr-2';

const ProductListModal = ({ onSelectProducts, Id, onRefresh }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        shortDescription: "",
        link: "",
        altText: "",
        shopNowLink: "",
        picture: null,
        mobilePicture: null,
        displayOrder: 0,
        PictureUrl: "",
        MobilePictureUrl: "",
    });

    const router = useRouter();

    const [backgroundPicture, setBackgroundPicture] = useState(null);
    const [backgroundPicturePreview, setBackgroundPicturePreview] = useState(null);

    const [mobilepicture, setmobilepicture] = useState(null);
    const [mobilepicturePreview, setmobilepicturePreview] = useState(null);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [id]: value }));
    };

    const handleFileChange = (e) => {
        const { id, files } = e.target;
        setFormData((prevData) => ({ ...prevData, [id]: files[0] }));
    };

    const handlePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setBackgroundPicture(file);
            setBackgroundPicturePreview(URL.createObjectURL(file));

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
                    setFormData(prevState => ({
                        ...prevState,
                        picture: response.data.Data.PictureId,
                        PictureUrl: response.data.Data.PictureUrl,
                    }));
                }
            } catch (error) {
                console.error('Error uploading picture:', error);
            }
        }
    };

    const removePicture = () => {
        setBackgroundPicture(null);
        setBackgroundPicturePreview(null);
        setFormData(prevState => ({ ...prevState, picture: 0 }));
    };

    const handlemobilepictureUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setmobilepicture(file);
            setmobilepicturePreview(URL.createObjectURL(file));

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
                    setFormData(prevState => ({
                        ...prevState,
                        mobilePicture: response.data.Data.PictureId,
                        MobilePictureUrl: response.data.Data.PictureUrl,
                    }));
                }
            } catch (error) {
                console.error('Error uploading picture:', error);
            }
        }
    };

    const removemobilepicture = () => {
        setmobilepicture(null);
        setmobilepicturePreview(null);
        setFormData(prevState => ({ ...prevState, mobilePicture: 0 }));
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            SliderItemTitle: formData.title,
            ShortDescription: formData.shortDescription,
            PictureId: formData.picture,
            MobilePictureId: formData.mobilePicture,
            ImageAltText: formData.altText,
            Link: formData.link,
            PictureUrl: formData.PictureUrl,
            MobilePictureUrl: formData.MobilePictureUrl,
            FullPictureUrl: formData.PictureUrl,
            MobileFullPictureUrl: formData.MobilePictureUrl,
            DisplayOrder: parseInt(formData.displayOrder),
            SliderId: parseInt(Id),
            ShopNowLink: formData.shopNowLink,
            Locales: [
                {
                    LanguageId: 1,
                    SliderItemTitle: null,
                    ShortDescription: null,
                    ImageAltText: null,
                    Link: null,
                    ShopNowLink: null
                }
            ],
            Id: parseInt(Id),
            CustomProperties: {}
        };

        try {
            const response = await CallFor2(
                "api/AnywhereSliderVendorShopAdminAPI/SliderItemCreatePopup",
                "POST",
                payload,
                "Auth"
            );

            if (response) {
                onRefresh()
                setIsOpen(false);
                console.log("Item added successfully:", response);
                onClose(); // Call onClose to refresh the parent component
            } else {
                console.error("Error adding item:", response);
                // Handle error (e.g., show error message to user)
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            // Handle error (e.g., show error message to user)
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setIsOpen(true)}>Add new item</Button>
            </DialogTrigger>
            <DialogContent className="max-h-screen w-full overflow-auto">
                <DialogHeader>
                    <DialogTitle>Product List</DialogTitle>
                    <DialogDescription>Search and select products</DialogDescription>
                </DialogHeader>
                <div className="p-6 bg-card rounded-lg shadow-md">
                    <div className="mb-4 flex items-center">
                        <label className={labelClasses} htmlFor="title">
                            Title<span className="text-destructive">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            className={inputClasses}
                            placeholder="Enter title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mb-4 flex items-center">
                        <label className={labelClasses} htmlFor="shortDescription">
                            Short description
                        </label>
                        <input
                            type="text"
                            id="shortDescription"
                            className={inputClasses}
                            placeholder="Enter short description"
                            value={formData.shortDescription}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="mb-4 flex items-center">
                        <label className={labelClasses} htmlFor="link">
                            Link
                        </label>
                        <input
                            type="url"
                            id="link"
                            className={inputClasses}
                            placeholder="Enter link"
                            value={formData.link}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="mb-4 flex items-center">
                        <label className={labelClasses} htmlFor="altText">
                            Alt
                        </label>
                        <input
                            type="text"
                            id="altText"
                            className={inputClasses}
                            placeholder="Enter alt text"
                            value={formData.altText}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="mb-4 flex items-center">
                        <label className={labelClasses} htmlFor="shopNowLink">
                            ShopNow Link
                        </label>
                        <input
                            type="text"
                            id="shopNowLink"
                            className={inputClasses}
                            placeholder="Enter ShopNow link"
                            value={formData.shopNowLink}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="mb-4 flex items-center">
                        <label className={labelClasses} htmlFor="picture">
                            Picture <span className="text-destructive">*</span>
                        </label>
                        <div className="flex flex-col items-start">
                            {!backgroundPicturePreview ? (
                                <Label>
                                    <Button asChild>
                                        <div>
                                            <Upload className="mr-2 h-4 w-4" /> Choose File
                                        </div>
                                    </Button>
                                    <Input
                                        type="file"
                                        className="hidden"
                                        onChange={handlePictureUpload}
                                    />
                                </Label>
                            ) : (
                                <div className="relative h-36 rounded-xl">
                                    <img
                                        src={backgroundPicturePreview}
                                        alt="Image Preview"
                                        className="w-full h-full border border-gray-300 rounded-md shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={removePicture}
                                        className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-sm border border-white focus:outline-none"
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mb-4 flex items-center">
                        <label className={labelClasses} htmlFor="mobilePicture">
                            Mobile picture <span className="text-destructive">*</span>
                        </label>
                        <div className="flex flex-col items-start">
                            {!mobilepicturePreview ? (
                                <Label>
                                    <Button asChild>
                                        <div>
                                            <Upload className="mr-2 h-4 w-4" /> Choose File
                                        </div>
                                    </Button>
                                    <Input
                                        type="file"
                                        className="hidden"
                                        onChange={handlemobilepictureUpload}
                                    />
                                </Label>
                            ) : (
                                <div className="relative h-36 rounded-xl">
                                    <img
                                        src={mobilepicturePreview}
                                        alt="Image Preview"
                                        className="w-full h-full border border-gray-300 rounded-md shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={removemobilepicture}
                                        className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-sm border border-white focus:outline-none"
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mb-4 flex items-center">
                        <label className={labelClasses} htmlFor="displayOrder">
                            Display order
                        </label>
                        <input
                            type="number"
                            id="displayOrder"
                            className={inputClasses}
                            placeholder="0"
                            value={formData.displayOrder}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} variant="outline">Save</Button>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ProductListModal;
