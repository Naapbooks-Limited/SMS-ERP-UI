"use client";
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { DialogDescription } from '@radix-ui/react-dialog';
import CallFor2 from "@/utilities/CallFor2";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

// Shared Tailwind CSS classes
const inputClasses = 'mt-1 block w-full border border-border rounded-md p-2';
const buttonClasses = 'px-4 py-2 rounded';
const imageClasses = 'w-16 h-16 border border-border rounded-md mr-2';
const labelClasses = 'block text-sm font-medium text-muted-foreground mr-2';

const Edititemmodel = ({ onSelectProducts,  Id, onRefresh }) => {
    const { register, handleSubmit, setValue, reset } = useForm();
    const [isOpen, setIsOpen] = useState(false);

    const [Ids, setIds] = useState(Id);
    const [backgroundPicture, setBackgroundPicture] = useState(null);
    const [backgroundPicturePreview, setBackgroundPicturePreview] = useState(null);

    const [mobilePicture, setMobilePicture] = useState(null);
    const [mobilePicturePreview, setMobilePicturePreview] = useState(null);
    const router = useRouter();

    // useEffect(() => {
    //     const FetchData = async () => {
    //         try {
    //             const response = await CallFor2(
    //                 `api/AnywhereSliderVendorShopAdminAPI/SliderItemEditPopup/${Id}`,
    //                 'get',
    //                 null,
    //                 'Auth'
    //             );

    //             if (response.data) {
    //                 reset({
    //                     title: response.data.SliderItemTitle,
    //                     shortDescription: response.data.ShortDescription,
    //                     link: response.data.Link,
    //                     altText: response.data.ImageAltText,
    //                     shopNowLink: response.data.ShopNowLink,
    //                     displayOrder: response.data.DisplayOrder,
    //                     picture: response.data.PictureId,
    //                     mobilePicture: response.data.MobilePictureId,
    //                     SliderId: response.data.SliderId,
    //                 });
    //                 setBackgroundPicturePreview(response.data.MobilePictureUrl);
    //                 setMobilePicturePreview(response.data.PictureUrl);
    //             }
    //         } catch (error) {
    //             console.error('Error uploading picture:', error);
    //         }
    //     }
    //     FetchData();
    // }, [Id, reset]);

    const [isLoading, setIsLoading] = useState(false);

    const handleOpenModal = async (e) => {
        e.preventDefault()
        setIsOpen(true);
        setIsLoading(true);
        try {
            const response = await CallFor2(
                `api/AnywhereSliderVendorShopAdminAPI/SliderItemEditPopup/${Id}`,
                'get',
                null,
                'Auth'
            );

            if (response.data) {
                reset({
                    title: response.data.SliderItemTitle,
                    shortDescription: response.data.ShortDescription,
                    link: response.data.Link,
                    altText: response.data.ImageAltText,
                    shopNowLink: response.data.ShopNowLink,
                    displayOrder: response.data.DisplayOrder,
                    picture: response.data.PictureId,
                    mobilePicture: response.data.MobilePictureId,
                    SliderId: response.data.SliderId,
                });
                setBackgroundPicturePreview(response.data.MobilePictureUrl);
                setMobilePicturePreview(response.data.PictureUrl);
            }
        } catch (error) {
            console.error('Error uploading picture:', error);
        }
     finally {
            setIsLoading(false);
        }
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
                    setValue('picture', response.data.Data.PictureId);
                    setValue('PictureUrl', response.data.Data.PictureUrl);
                    setValue('FullPictureUrl', response.data.Data.PictureUrl);
                }
            } catch (error) {
                console.error('Error uploading picture:', error);
            }
        }
    };

    const removePicture = () => {
        setBackgroundPicture(null);
        setBackgroundPicturePreview(null);
        setValue('picture', 0);
    };

    const handleMobilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setMobilePicture(file);
            setMobilePicturePreview(URL.createObjectURL(file));

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
                    setValue('mobilePicture', response.data.Data.PictureId);
                    setValue('MobilePictureUrl', response.data.Data.PictureUrl);
                    setValue('MobileFullPictureUrl', response.data.Data.PictureUrl);
                }
            } catch (error) {
                console.error('Error uploading picture:', error);
            }
        }
    };

    const removeMobilePicture = () => {
        setMobilePicture(null);
        setMobilePicturePreview(null);
        setValue('mobilePicture', 0);
    };

    const onSubmit = async (data) => {
        const payload = {
            SliderItemTitle: data.title,
            ShortDescription: data.shortDescription,
            PictureId: data.picture,
            MobilePictureId: data.mobilePicture,
            ImageAltText: data.altText,
            Link: data.link,
            PictureUrl: data.PictureUrl,
            MobilePictureUrl: data.MobilePictureUrl,
            FullPictureUrl: data.FullPictureUrl,
            MobileFullPictureUrl: data.MobileFullPictureUrl,
            DisplayOrder: parseInt(data.displayOrder),
            SliderId: data.SliderId,
            ShopNowLink: data.shopNowLink,
            Locales: [
                {
                    LanguageId: 1,
                    SliderItemTitle: null,
                    ShortDescription: null,
                    ImageAltText: null,
                    Link: null,
                    ShopNowLink: null,
                }
            ],
            Id: Ids,
            CustomProperties: {},
        };

        const response = await CallFor2(
            "api/AnywhereSliderVendorShopAdminAPI/SliderItemEditPopup",
            "POST",
            payload,
            "Auth"
        );

        if (response) {
            onRefresh();
            setIsOpen(false); 
            // router.push(`/station/portals/Banner/editbanner/${Ids}`)
        }
        console.log(response);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={handleOpenModal}>Edit item</Button>
            </DialogTrigger>
            <DialogContent className="max-h-screen w overflow-auto">
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
<>
                <DialogHeader>
                    <DialogTitle>Product List</DialogTitle>
                    <DialogDescription>Search and select products</DialogDescription>
                </DialogHeader>
                <div className="p-6 bg-card rounded-lg shadow-md">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4 flex items-center">
                            <label className={labelClasses} htmlFor="title">
                                Title <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                className={inputClasses}
                                placeholder="Enter title"
                                {...register("title", { required: true })}
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
                                {...register("shortDescription")}
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
                                {...register("link")}
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
                                {...register("altText")}
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
                                {...register("shopNowLink")}
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
                                {!mobilePicturePreview ? (
                                    <Label>
                                        <Button asChild>
                                            <div>
                                                <Upload className="mr-2 h-4 w-4" /> Choose File
                                            </div>
                                        </Button>
                                        <Input
                                            type="file"
                                            className="hidden"
                                            onChange={handleMobilePictureUpload}
                                        />
                                    </Label>
                                ) : (
                                    <div className="relative h-36 rounded-xl">
                                        <img
                                            src={mobilePicturePreview}
                                            alt="Image Preview"
                                            className="w-full h-full border border-gray-300 rounded-md shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeMobilePicture}
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
                                {...register("displayOrder")}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" variant="outline">Save</Button>
                            <DialogClose asChild>
                                <Button variant="outline">Close</Button>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                </div>
                </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default Edititemmodel;
