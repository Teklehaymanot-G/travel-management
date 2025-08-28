import React, { useState } from "react";
import DataGrid from "../../ui/DataGrid";
import FormDialog from "../../ui/FormDialog";
import { coupons } from "../../utils/dummyData";

const CouponManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState(null);

  const handleEdit = (coupon) => {
    setCurrentCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setCurrentCoupon(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (coupon) => {
    console.log("Delete coupon:", coupon);
    alert(`Delete coupon: ${coupon.code}`);
  };

  const couponActions = [
    { label: "Edit", onClick: handleEdit },
    {
      label: "Delete",
      onClick: handleDelete,
      className: "text-red-600 hover:text-red-900",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Coupon Management</h2>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create New Coupon
        </button>
      </div>

      <DataGrid
        headers={["Code", "Discount", "Valid From", "Valid To", "Times Used"]}
        rows={coupons.map((coupon) => [
          <span className="font-mono bg-yellow-100 px-2 py-1 rounded">
            {coupon.code}
          </span>,
          `${coupon.discount}%`,
          coupon.validFrom,
          coupon.validTo,
          coupon.used,
        ])}
        actions={couponActions}
      />

      <FormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={currentCoupon ? "Edit Coupon" : "Create New Coupon"}
        onSubmit={() => {
          console.log("Save coupon:", currentCoupon);
          setIsDialogOpen(false);
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Coupon Code
            </label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={currentCoupon?.code || ""}
              onChange={(e) =>
                setCurrentCoupon({ ...currentCoupon, code: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Discount (%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={currentCoupon?.discount || ""}
              onChange={(e) =>
                setCurrentCoupon({
                  ...currentCoupon,
                  discount: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Valid From
              </label>
              <input
                type="date"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={currentCoupon?.validFrom || ""}
                onChange={(e) =>
                  setCurrentCoupon({
                    ...currentCoupon,
                    validFrom: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Valid To
              </label>
              <input
                type="date"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={currentCoupon?.validTo || ""}
                onChange={(e) =>
                  setCurrentCoupon({
                    ...currentCoupon,
                    validTo: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default CouponManagement;
