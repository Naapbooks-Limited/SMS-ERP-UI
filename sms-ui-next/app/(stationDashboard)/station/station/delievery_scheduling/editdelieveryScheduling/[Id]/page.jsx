"use client"
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useRouter } from 'next/navigation';
import CallFor2 from '@/utilities/CallFor2';
import Link from 'next/link';
import { toast as reToast } from "react-hot-toast";
import * as Yup from 'yup';


const inputClasses = 'w-full p-2 border border-gray-300 rounded-md';
const labelClasses = 'block mb-1 font-medium w-1/4';
const containerClasses = 'flex items-center space-x-4';

const animatedComponents = makeAnimated();

const schema = Yup.object().shape({
    start: Yup.string().required('Start time is required'),
    end: Yup.string().required('End time is required'),
    displayOrder: Yup.number()
        .required('Display order is required')
        .integer('Display order must be an integer')
        .positive('Display order must be a positive number'),
    isActive: Yup.boolean(),
    selectedShippingMethods: Yup.array().min(1, 'Please select at least one shipping method'),
});



const CustomTimePicker = ({ value, onChange, className }) => {
    const parseTime = (time) => {
        const [timePart, ampm] = time.split(/(AM|PM)/);
        let [hours, minutes] = timePart.split(':').map(Number);
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        return { hours, minutes, isAM: ampm === 'AM' };
    };

    const { hours: initialHours, minutes: initialMinutes, isAM: initialIsAM } = parseTime(value);

    const [hours, setHours] = useState(initialHours);
    const [minutes, setMinutes] = useState(initialMinutes);
    const [isAM, setIsAM] = useState(initialIsAM);

    useEffect(() => {
        const { hours: updatedHours, minutes: updatedMinutes, isAM: updatedIsAM } = parseTime(value);
        setHours(updatedHours);
        setMinutes(updatedMinutes);
        setIsAM(updatedIsAM);
    }, [value]);

    const handleHourChange = (event) => {
        let newHours = parseInt(event.target.value, 10);
        if (newHours > 12) newHours = 12;
        if (newHours < 1) newHours = 1;
        setHours(newHours);
        updateTime(newHours, minutes, isAM);
    };

    const handleMinuteChange = (event) => {
        let newMinutes = parseInt(event.target.value, 10);
        if (newMinutes > 59) newMinutes = 59;
        if (newMinutes < 0) newMinutes = 0;
        setMinutes(newMinutes);
        updateTime(hours, newMinutes, isAM);
    };

    const toggleAMPM = () => {
        const newIsAM = !isAM;
        setIsAM(newIsAM);
        updateTime(hours, minutes, newIsAM);
    };

    const updateTime = (hours, minutes, isAM) => {
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
        const ampm = isAM ? 'AM' : 'PM';
        const finalTime = `${formattedHours}:${formattedMinutes} ${ampm}`;
        onChange(finalTime);
    };

    return (
        <div className={`flex items-center ${className}`}>
            <input
                type="number"
                value={hours % 12 === 0 ? 12 : hours % 12}
                onChange={handleHourChange}
                className="w-12 p-1 border border-gray-300 rounded-md text-center"
            />
            <span className="mx-1">:</span>
            <input
                type="number"
                value={minutes < 10 ? `0${minutes}` : minutes}
                onChange={handleMinuteChange}
                className="w-12 p-1 border border-gray-300 rounded-md text-center"
            />
            <button
                type="button"
                onClick={toggleAMPM}
                className="ml-2 p-1 border border-gray-300 rounded-md"
            >
                {isAM ? 'AM' : 'PM'}
            </button>
        </div>
    );
};

const EditDeliverySlot = ({ params }) => {
    const [timeSlot, setTimeSlot] = useState({ start: '', end: '' });
    const [displayOrder, setDisplayOrder] = useState();
    const [isActive, setIsActive] = useState(false);
    const [selectedShippingMethods, setSelectedShippingMethods] = useState([]);
    const [selectedStores, setSelectedStores] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [availableShippingMethods, setAvailableShippingMethods] = useState([]);
    const [availableStores, setAvailableStores] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await CallFor2(`api-fe/DeliverySlotAdminAPI/Edit/${params.Id}`, 'GET', null, 'Auth');
                if (response) {
                    const { TimeSlot, DisplayOrder, Active, SelectedShippingMethodIds, AvailableShippingMethods, SelectedStoreIds, AvailableStores } = response.data;

                    let start = '', end = '';
                    if (TimeSlot) {
                        [start, end] = TimeSlot.split('-').map(time => time.trim());
                    }

                    setTimeSlot({ start, end });
                    setDisplayOrder(DisplayOrder);
                    setIsActive(Active);

                    setSelectedShippingMethods(SelectedShippingMethodIds ? SelectedShippingMethodIds.map(String) : []);
                    setSelectedStores(SelectedStoreIds ? SelectedStoreIds.map(String) : []);

                    setAvailableShippingMethods(AvailableShippingMethods.map(method => ({
                        value: method.Value,
                        label: method.Text,
                        selected: method.Selected
                    })));
                    setAvailableStores(AvailableStores.map(store => ({
                        value: store.Value,
                        label: store.Text,
                        selected: store.Selected
                    })));
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [params.Id]);

    const handleShippingMethodChange = (selectedOptions) => {
        setSelectedShippingMethods(selectedOptions ? selectedOptions.map(option => option.value) : []);
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            selectedShippingMethods: '',
        }));
    };

    const handleStoreChange = (selectedOptions) => {
        setSelectedStores(selectedOptions ? selectedOptions.map(option => option.value) : []);
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            selectedStores: '',
        }));
    };

    const handleTimeSlotChange = (field, value) => {
        setTimeSlot((prevTimeSlot) => ({ ...prevTimeSlot, [field]: value }));
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            [field]: '',
        }));
    };

    const handleChangeDisplayOrder = (e) => {
        const { value } = e.target;
        setDisplayOrder(Number(value));
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            displayOrder: '',
        }));
    };

    const handleChangeIsActive = (e) => {
        setIsActive(e.target.checked);
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            isActive: '',
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // Validate form fields
            await schema.validate({
                start: timeSlot.start,
                end: timeSlot.end,
                displayOrder,
                isActive,
                selectedShippingMethods,
            }, { abortEarly: false });

            // Construct API body
            const formattedTimeSlot = `${timeSlot.start}-${timeSlot.end}`;

            const apiBody = {
                TimeSlot: formattedTimeSlot,
                DisplayOrder: displayOrder,
                Active: isActive,
                CreatedOn: new Date().toISOString(),
                SelectedShippingMethodIds: selectedShippingMethods.map(Number),
                AvailableShippingMethods: availableShippingMethods,
                SelectedStoreIds: selectedStores.map(Number),
                Locales: [{ LanguageId: 1, TimeSlot: null }],
                Id: params.Id,
                CustomProperties: {}
            };

            // Make API call
            const response = await CallFor2('api-fe/DeliverySlotAdminAPI/Edit', 'POST', apiBody, 'Auth');
            if (response) {
                reToast.success("Saved successfully!");
                router.push("/station/station/delievery_scheduling");
            } else {
                reToast.error("Error saving delivery slot.");
                console.error("Failed to update delivery slot:", response.statusText);
            }

        } catch (error) {
            if (error.name === 'ValidationError') {
                const newErrors = {};
                error.inner.forEach(err => {
                    newErrors[err.path] = err.message;
                });
                setFormErrors(newErrors);
            } else {
                console.error("Error updating delivery slot:", error);
            }
        }
    };

    return (
        <div className="mx-auto p-6">
            <h1 className="text-2xl font-bold text-orange-400 mb-6">Edit Delivery Slot</h1>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1">
                    <div className={containerClasses}>
                        <label className="block mb-1 font-medium w-1/5">Time Slot</label>
                        <div className="flex space-x-4">
                            <div> Start Time<br/>
                            <CustomTimePicker
                                value={timeSlot.start}
                                onChange={(value) => handleTimeSlotChange('start', value)}
                                className={inputClasses}
                            />
                        </div>

                            <div> End  Time<br/>
                            <CustomTimePicker
                                value={timeSlot.end}
                                onChange={(value) => handleTimeSlotChange('end', value)}
                                className={inputClasses}
                            />
                        </div>

                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <label className="block mb-1 font-medium w-1/5"></label>
                        {formErrors.start && <p className="text-red-500 text-sm">{formErrors.start}</p>}
                        {formErrors.end && <p className="text-red-500 text-sm">{formErrors.end}</p>}
                    </div>
                    <div className={containerClasses}>
                        <label className={labelClasses}>Display Order</label>
                        <input
                            type="number"
                            id="display-order"
                            value={displayOrder}
                            onChange={handleChangeDisplayOrder}
                            className={inputClasses}
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <label className="block mb-1 font-medium w-1/5"></label>
                        {formErrors.displayOrder && <p className="text-red-500 text-sm">{formErrors.displayOrder}</p>}
                    </div>
                    <div className={containerClasses}>
                        <label className={labelClasses}>Active</label>
                        <input
                            type="checkbox"
                            id="active"
                            checked={isActive}
                            onChange={handleChangeIsActive}
                            className="ml-2"
                        />
                    </div>
                    <div className={containerClasses}>
                        <label className={labelClasses}>Limited to Shipping Methods</label>
                        <Select
                            isMulti
                            options={availableShippingMethods}
                            components={animatedComponents}
                            className="w-full text-black"
                            classNamePrefix="select"
                            value={availableShippingMethods.filter(method => selectedShippingMethods.includes(method.value))}
                            onChange={handleShippingMethodChange}
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <label className="block mb-1 font-medium w-1/5"></label>
                        {formErrors.selectedShippingMethods && <p className="text-red-500 text-sm">{formErrors.selectedShippingMethods}</p>}
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <Link href={"/station/station/delievery_scheduling"}>
                        <Button className="bg-gray-500 text-white py-2 px-4 rounded-md">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md">
                        Save
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditDeliverySlot;
