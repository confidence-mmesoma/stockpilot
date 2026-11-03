import { useState, type FormEvent } from 'react';
import { ApiError } from '../api/http';
import type { ProductInput } from '../types';
import { Button } from './Button';
import { FormField } from './FormField';

type FormValues = Record<keyof ProductInput, string>;
type FormErrors = Partial<Record<keyof ProductInput, string>>;

type Props = {
  initialValues?: ProductInput;
  submitLabel: string;
  onSubmit: (input: ProductInput) => Promise<void>;
  onCancel: () => void;
};

function toFormValues(input?: ProductInput): FormValues {
  if (!input) return { name: '', sku: '', price: '', stock: '', lowStockThreshold: '5' };
  return {
    name: input.name,
    sku: input.sku,
    price: String(input.price),
    stock: String(input.stock),
    lowStockThreshold: String(input.lowStockThreshold),
  };
}

function isWholeNumber(text: string) {
  const n = Number(text);
  return text.trim() !== '' && Number.isInteger(n) && n >= 0;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const price = Number(values.price);

  if (!values.name.trim()) errors.name = 'Name is required';
  if (!values.sku.trim()) errors.sku = 'SKU is required';
  if (values.price.trim() === '' || Number.isNaN(price) || price <= 0) {
    errors.price = 'Price must be greater than 0';
  }
  if (!isWholeNumber(values.stock)) errors.stock = 'Stock must be a whole number, 0 or more';
  if (!isWholeNumber(values.lowStockThreshold)) {
    errors.lowStockThreshold = 'Threshold must be a whole number, 0 or more';
  }
  return errors;
}

export function ProductForm({ initialValues, submitLabel, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<FormValues>(toFormValues(initialValues));
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = (field: keyof ProductInput) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        sku: values.sku.trim(),
        price: Number(values.price),
        stock: Number(values.stock),
        lowStockThreshold: Number(values.lowStockThreshold),
      });
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        // Show the server's field errors under the matching inputs
        const mapped: FormErrors = {};
        for (const issue of err.errors) {
          mapped[issue.field as keyof ProductInput] = issue.message;
        }
        setErrors(mapped);
      } else {
        setFormError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name" name="name" value={values.name} onChange={setField('name')} error={errors.name} />
        <FormField label="SKU" name="sku" value={values.sku} onChange={setField('sku')} error={errors.sku} />
        <FormField
          label="Price (₦)"
          name="price"
          value={values.price}
          onChange={setField('price')}
          error={errors.price}
          inputMode="decimal"
        />
        <FormField
          label="Stock"
          name="stock"
          value={values.stock}
          onChange={setField('stock')}
          error={errors.stock}
          inputMode="numeric"
        />
        <FormField
          label="Low-stock threshold"
          name="lowStockThreshold"
          value={values.lowStockThreshold}
          onChange={setField('lowStockThreshold')}
          error={errors.lowStockThreshold}
          inputMode="numeric"
        />
      </div>

      {formError && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {formError}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}