import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

export function useLoginForm(onSuccess) {
  const { login, clearError, loading, error } = useAuthStore();

  const [formValues, setFormValues] = useState({ email: "", password: "", remember: false });
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field) => (event) => {
    if (error) clearError();
    setFormValues((prev) => ({ ...prev, [field]: field === "remember" ? event.target.checked : event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (!formValues.email || !formValues.password) {
      return;
    }

    const result = await login(formValues.email.trim(), formValues.password);
    if (result.success && onSuccess) {
      onSuccess(result);
    }
  };

  return { formValues, submitted, loading, updateField, handleSubmit };
}

export default useLoginForm;
