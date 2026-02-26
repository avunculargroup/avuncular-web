"use client";

import { useState } from "react";

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface FormData {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  schema: unknown;
}

export default function PublicFormView({ form }: { form: FormData }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const fields = Array.isArray(form.schema)
    ? (form.schema as FormField[])
    : ((form.schema as { fields?: FormField[] })?.fields ?? []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: form.id, data: values }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to submit");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-[400px] text-center">
        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl font-mono font-semibold">₿</span>
        </div>
        <h1 className="text-lg font-medium text-gray-900 mb-2">Thank you!</h1>
        <p className="text-sm text-gray-500">
          Your submission has been received.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="text-center mb-6">
        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-lg font-mono font-semibold">₿</span>
        </div>
        <h1 className="text-lg font-medium text-gray-900">{form.name}</h1>
        {form.description && (
          <p className="text-sm text-gray-500 mt-1">{form.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                value={values[field.name] || ""}
                onChange={(e) =>
                  setValues({ ...values, [field.name]: e.target.value })
                }
                placeholder={field.placeholder}
                required={field.required}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:ring-orange-500 outline-none"
              />
            ) : field.type === "select" && field.options ? (
              <select
                value={values[field.name] || ""}
                onChange={(e) =>
                  setValues({ ...values, [field.name]: e.target.value })
                }
                required={field.required}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-orange-500 outline-none"
              >
                <option value="">Select...</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || "text"}
                value={values[field.name] || ""}
                onChange={(e) =>
                  setValues({ ...values, [field.name]: e.target.value })
                }
                placeholder={field.placeholder}
                required={field.required}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-orange-500 outline-none"
              />
            )}
          </div>
        ))}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-orange-500 text-white font-medium text-sm py-2.5 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
