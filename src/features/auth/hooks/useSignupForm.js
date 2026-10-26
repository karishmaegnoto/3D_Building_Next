import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {validateCompanyName,validateEmail,validatePassword,validatePhone,} from "../validations/authValidation";

export function useSignupForm(onSuccess) {
  const { signup, clearError, loading, error } = useAuthStore();

  const [formValues, setFormValues] = useState({
    companyName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const getValidationErrors = (values) => {
    return {
      companyName: validateCompanyName(values.companyName),
      email: validateEmail(values.email),
      password: validatePassword(values.password),
      phone: validatePhone(values.phone),
    };
  };

  const validationErrors = getValidationErrors(formValues);
  const isValid = !Object.values(validationErrors).some(Boolean);

  const updateField = (field) => (event) => {
    if (error) clearError();
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    setSubmitted(true);

    if (!isValid) return;

    const result = await signup({
      companyName: formValues.companyName.trim(),
      email: formValues.email.trim(),
      password: formValues.password,
      phone: formValues.phone.trim(),
      address: {},
    });

    if (result.success && onSuccess) {
      onSuccess(result);
    }
  };

  return {
    formValues,
    submitted,
    loading,
    validationErrors,
    isValid,
    updateField,
    handleSubmit,
  };
}

export default useSignupForm;
