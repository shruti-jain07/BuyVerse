"use client";

import { useState, useEffect } from "react";

// Define Variant type properly
 export type Variant = {
  id: string;
  price: number;
  options: {
    label: string;
    attribute?: {
      name: string;
    };
  }[];
};

interface Props {
  variants?: Variant[] | null;
  onVariantChange?: (variant: Variant | null) => void;
}

export const VariantSelector = ({ variants, onVariantChange }: Props) => {
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [attributeNames, setAttributeNames] = useState<string[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  // Extract all attribute names (Size, Color, RAM, etc.)
  useEffect(() => {
    if (!variants) return;
    const attrs = new Set<string>();
    variants.forEach((variant) =>
  (variant.options || []).forEach((opt) => {
    if (opt?.attribute?.name) {
      attrs.add(opt.attribute.name);
    }
  })
);
    setAttributeNames(Array.from(attrs));
  }, [variants]);

  // Match variant based on selected options
  useEffect(() => {
  if (!variants || attributeNames.length === 0) return;

  const allSelected = attributeNames.every(attr => !!selectedOptions[attr]);

  if (!allSelected) {
    setSelectedVariant(null);
    onVariantChange?.(null);
    return;
  }

  const match = variants.find((variant) =>
    variant.options.every((opt) => {
      const attr = opt.attribute?.name;
      if (!attr) return false;
      return selectedOptions[attr] === opt.label;
    })
  );

  if (match?.id !== selectedVariant?.id) {
    setSelectedVariant(match ?? null);
    onVariantChange?.(match ?? null);
  }
}, [selectedOptions, variants, attributeNames]);

  const handleOptionChange = (attribute: string, label: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [attribute]: label,
    }));
  };

  const formatCurrency = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

    // Check if an option is still possible given the current selection
  const isOptionAvailable = (attribute: string, label: string) => {
    if (!variants) return false;

    return variants.some((variant) => {
      return variant.options.every((opt) => {
        const attrName = opt.attribute?.name;
        if (!attrName) return false;

        if (attrName === attribute) {
          // Option being checked must match
          return opt.label === label;
        }

        // For other attributes, must match the selected option if already chosen
        if (selectedOptions[attrName]) {
          return opt.label === selectedOptions[attrName];
        }

        return true; // not yet selected, so allow
      });
    });
  };

  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-4 mt-6">
      {attributeNames.map((attrName) => {
        const optionLabels = Array.from(
  new Set(
    variants
      .flatMap((v) => (v.options || []).filter(opt => opt?.attribute?.name === attrName && opt.label))
      .map((opt) => opt.label)
  )
);

        return (
          <div key={attrName}>
            <p className="font-medium mb-1">{attrName}</p>
            <div className="flex gap-2 flex-wrap">
              {optionLabels.map((label) => {
                const available = isOptionAvailable(attrName, label);

                return (
                  <button
                    key={label}
                    onClick={() => available && handleOptionChange(attrName, label)}
                    disabled={!available}
                    className={`px-3 py-1 rounded border text-sm transition ${
                      selectedOptions[attrName] === label
                        ? "bg-black text-white"
                        : available
                        ? "bg-white hover:bg-gray-100"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div>
        {selectedVariant ? (
          <p className="text-lg font-medium">
            Price: {formatCurrency(selectedVariant.price)}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Please select all options
          </p>
        )}
      </div>
    </div>
  );
};
