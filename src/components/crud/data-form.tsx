"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FieldConfig, SelectOption } from "@/types/database";

type DataFormProps = {
  fields: FieldConfig[];
  values?: Record<string, string>;
  dynamicOptions?: Record<string, SelectOption[]>;
  formId: string;
};

export function DataForm({ fields, values = {}, dynamicOptions = {}, formId }: DataFormProps) {
  const visibleFields = fields.filter((field) => !field.hiddenInForm);
  const [selectValues, setSelectValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      visibleFields
        .filter((field) => field.type === "select")
        .map((field) => [field.key, values[field.key] ?? ""]),
    ),
  );

  return (
    <div className="space-y-4">
      {visibleFields.map((field) => {
        const value = values[field.key] ?? "";
        const options = dynamicOptions[field.key] ?? field.options ?? [];

        if (field.type === "hidden") {
          return <input key={field.key} type="hidden" name={field.key} value={value} form={formId} />;
        }

        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={`${formId}-${field.key}`}>{field.label}</Label>

            {field.type === "textarea" ? (
              <Textarea
                id={`${formId}-${field.key}`}
                name={field.key}
                defaultValue={value}
                placeholder={field.placeholder}
                required={field.required}
                readOnly={field.readOnly}
                form={formId}
              />
            ) : field.type === "select" ? (
              <>
                <input
                  type="hidden"
                  name={field.key}
                  value={selectValues[field.key] ?? ""}
                  form={formId}
                />
                <Select
                  value={selectValues[field.key] || undefined}
                  onValueChange={(nextValue) =>
                    setSelectValues((current) => ({ ...current, [field.key]: nextValue ?? "" }))
                  }
                  required={field.required}
                >
                  <SelectTrigger id={`${formId}-${field.key}`} className="w-full">
                    <SelectValue placeholder={`Выберите ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <Input
                id={`${formId}-${field.key}`}
                name={field.key}
                type={field.type}
                defaultValue={value}
                placeholder={field.placeholder}
                required={field.required}
                readOnly={field.readOnly}
                form={formId}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
