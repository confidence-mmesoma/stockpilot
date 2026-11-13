import { useState, type FormEvent } from "react";
import { ApiError } from "../api/http";
import type { StaffInput } from "../types";
import { Button } from "./Button";
import { FormField } from "./FormField";

type Errors = Partial<Record<keyof StaffInput, string>>;

type Props = {
  onSubmit: (input: StaffInput) => Promise<void>;
  onCancel: () => void;
};

function validate(values: StaffInput): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Name is required";
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address";
  if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (values.password.length > 72) {
    errors.password = "Password must be 72 characters or less";
  }
  return errors;
}

export function StaffForm({ onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<StaffInput>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = (field: keyof StaffInput) => (value: string) =>
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
        email: values.email.trim(),
        password: values.password,
      });
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const mapped: Errors = {};
        for (const issue of err.errors) {
          mapped[issue.field as keyof StaffInput] = issue.message;
        }
        setErrors(mapped);
      } else {
        setFormError(
          err instanceof Error ? err.message : "Something went wrong",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-5"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          label="Name"
          name="name"
          value={values.name}
          onChange={setField("name")}
          error={errors.name}
        />
        <FormField
          label="Email"
          name="email"
          value={values.email}
          onChange={setField("email")}
          error={errors.email}
        />
        <FormField
          label="Temporary password"
          name="password"
          type="password"
          value={values.password}
          onChange={setField("password")}
          error={errors.password}
        />
      </div>

      {formError && (
        <p
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {formError}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Create staff account"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
