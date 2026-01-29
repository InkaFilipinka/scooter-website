"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { addOns, type AddOn } from "@/data/add-ons";

interface AddOnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedAddOns: string[]) => void;
  rentalDays: number;
}

export function AddOnsModal({ isOpen, onClose, onConfirm, rentalDays }: AddOnsModalProps) {
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  if (!isOpen) return null;

  // Separate free and paid add-ons
  const freeAddOns = addOns.filter(a => a.isFree);
  const paidAddOns = addOns.filter(a => !a.isFree);

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addOnId)
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const calculateAddOnsTotal = () => {
    return selectedAddOns.reduce((total, id) => {
      const addOn = addOns.find(a => a.id === id);
      if (!addOn || addOn.isFree) return total;
      return total + (addOn.perDay ? addOn.price * rentalDays : addOn.price);
    }, 0);
  };

  const handleConfirm = () => {
    onConfirm(selectedAddOns);
  };

  const handleSkip = () => {
    onConfirm([]);
  };

  const renderAddOnButton = (addOn: AddOn) => {
    const isSelected = selectedAddOns.includes(addOn.id);
    const price = addOn.perDay ? addOn.price * rentalDays : addOn.price;

    return (
      <button
        key={addOn.id}
        onClick={() => toggleAddOn(addOn.id)}
        aria-label={`${isSelected ? 'Deselect' : 'Select'} ${addOn.name}${addOn.isFree ? ' (Free)' : ` for ${price} pesos`}`}
        className={`text-left p-4 rounded-lg border-2 transition-all ${
          isSelected
            ? addOn.isFree
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
            : 'border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
              isSelected
                ? addOn.isFree ? 'bg-green-500 border-green-500' : 'bg-teal-500 border-teal-500'
                : 'border-slate-300 dark:border-slate-600'
            }`}>
              {isSelected && (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{addOn.icon}</span>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                {addOn.name}
              </h4>
              {addOn.isFree && (
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  FREE
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              {addOn.description}
            </p>
            {!addOn.isFree && (
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                  ₱{price}
                </span>
                {addOn.perDay && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    (₱{addOn.price}/day × {rentalDays} days)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                🎒 Enhance Your Ride
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Select free items and optional paid add-ons
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close add-ons modal"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Add-ons Content */}
        <div className="p-6">
          {/* Free Add-ons Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
              🎁 Free Items (Included with your rental)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {freeAddOns.map(renderAddOnButton)}
            </div>
          </div>

          {/* Paid Add-ons Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              🛒 Optional Paid Add-ons
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paidAddOns.map(renderAddOnButton)}
            </div>
          </div>

          {/* Summary */}
          {selectedAddOns.length > 0 && (
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-lg p-4 border-2 border-teal-200 dark:border-teal-700 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {calculateAddOnsTotal() > 0 ? 'Paid Add-ons Total' : 'Selected Free Items'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {selectedAddOns.length} item{selectedAddOns.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {calculateAddOnsTotal() > 0 ? `+₱${calculateAddOnsTotal()}` : 'FREE'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6">
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Skip Add-ons
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-lg font-semibold transition-all shadow-lg"
            >
              {selectedAddOns.length > 0 ? `Continue with ${selectedAddOns.length} Item${selectedAddOns.length !== 1 ? 's' : ''}` : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
