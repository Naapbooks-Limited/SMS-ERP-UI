import React from 'react';

const inputClasses = "mt-1 p-2 border border-border rounded w-full";
const labelClasses = "block text-muted-foreground";
const checkboxClasses = "form-checkbox";
const buttonClasses = "p-2 rounded";

const ShipmentForm = () => {
    return (
        <div className="p-6 bg-background rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-primary">Add a new shipment to order #1154</h2>
            <div className="mt-4">
                <label className={labelClasses}>Tracking number</label>
                <input type="text" placeholder="This will be auto generated once you save it" className={inputClasses} />
            </div>

            <div className="mt-4">
                <label className={labelClasses}>Admin comment</label>
                <input type="text" className={inputClasses} />
            </div>

            <div className="mt-4 flex items-center">
                <label className="text-muted-foreground mr-2">Shipped</label>
                <input type="checkbox" className={checkboxClasses} checked />
            </div>

            <div className="flex items-center">
                <label className="text-muted-foreground mr-2">Delivered</label>
                <input type="checkbox" className={checkboxClasses} />
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold text-primary">Products shipped</h3>
                <table className="min-w-full mt-4 border border-border">
                    <thead>
                        <tr className="bg-card text-left">
                            <th className="border-b border-border p-2">Product</th>
                            <th className="border-b border-border p-2">SKU</th>
                            <th className="border-b border-border p-2">Warehouse</th>
                            <th className="border-b border-border p-2">Item weight</th>
                            <th className="border-b border-border p-2">Item dimensions</th>
                            <th className="border-b border-border p-2">Qty ordered</th>
                            <th className="border-b border-border p-2">Qty shipped</th>
                            <th className="border-b border-border p-2">Qty to ship</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border-b border-border p-2">Aashirvaad Atta 10kg</td>
                            <td className="border-b border-border p-2">9250</td>
                            <td className="border-b border-border p-2">Khokra (121 qty)</td>
                            <td className="border-b border-border p-2">10000.00 [lb(s)]</td>
                            <td className="border-b border-border p-2">0.00x0.00x0.00 [inch(es)]</td>
                            <td className="border-b border-border p-2">2</td>
                            <td className="border-b border-border p-2">0</td>
                            <td className="border-b border-border p-2"><input type="number" className="border border-border rounded w-full" value="2" /></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex justify-between">
                <button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 p-2 rounded">Save</button>
                <button className="bg-muted text-muted-foreground hover:bg-muted/80 p-2 rounded">Back</button>
            </div>
        </div>
    );
};

export default ShipmentForm;
