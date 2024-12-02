"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface AddInstitutionFormProps {
  onSubmit: (formData: Record<string, FormDataEntryValue>) => void;
  onClose: () => void;
  selectedInstitution?: MedicalInstitution; // Optional prop for edit functionality
}

const AddInstitutionForm: React.FC<AddInstitutionFormProps> = ({
  onSubmit,
  onClose,
  selectedInstitution,
}) => {
  return (
    <div className="p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          onSubmit(Object.fromEntries(formData));
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={selectedInstitution?.name || ""}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Enter institution name"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            required
            defaultValue={selectedInstitution?.phone || ""}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label htmlFor="addressLineOne" className="block text-sm font-medium text-gray-700">
            Address Line One
          </label>
          <input
            type="text"
            id="addressLineOne"
            name="addressLineOne"
            required
            defaultValue={selectedInstitution?.address?.addressLineOne || ""}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Enter address line one"
          />
        </div>
        <div>
          <label htmlFor="addressLineTwo" className="block text-sm font-medium text-gray-700">
            Address Line Two
          </label>
          <input
            type="text"
            id="addressLineTwo"
            name="addressLineTwo"
            defaultValue={selectedInstitution?.address?.addressLineTwo || ""}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Enter address line two"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            defaultValue={selectedInstitution?.address?.city || ""}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Enter city"
          />
        </div>
        <div>
          <label htmlFor="province" className="block text-sm font-medium text-gray-700">
            Province
          </label>
          <input
            type="text"
            id="province"
            name="province"
            required
            defaultValue={selectedInstitution?.address?.province || ""}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Enter province"
          />
        </div>

        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
            Postal Code
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            required
            defaultValue={selectedInstitution?.address?.postalCode || ""}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Enter postal code"
          />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            required
            defaultValue={selectedInstitution?.address?.country || ""}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Enter country"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Address Type
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue={selectedInstitution?.address?.type || ""}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Select Address Type</option>
            <option value="PERMANENT">Permanent</option>
            <option value="CURRENT">Current</option>
          </select>
        </div>

        <div className="md:col-span-2 mt-4">
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2">
            {selectedInstitution ? "Update" : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddInstitutionForm;
