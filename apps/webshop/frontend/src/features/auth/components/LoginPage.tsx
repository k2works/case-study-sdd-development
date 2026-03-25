import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import { useLogin } from "../hooks/useLogin";
import { useAuth } from "../../../providers/AuthProvider";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { mutate, isPending } = useLogin();
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(email: string, password: string) {
    setErrorMessage("");
    mutate(
      { email, password },
      {
        onSuccess: (data) => {
          login(data.token, data.name, data.role);
          if (data.role === "CUSTOMER") {
            navigate("/products");
          } else {
            navigate("/admin");
          }
        },
        onError: (error: Error) => {
          setErrorMessage(error.message);
        },
      },
    );
  }

  return (
    <LoginForm
      onSubmit={handleSubmit}
      errorMessage={errorMessage}
      isLoading={isPending}
    />
  );
}
