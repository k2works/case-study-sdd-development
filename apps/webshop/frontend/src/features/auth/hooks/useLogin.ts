import { useMutation } from "@tanstack/react-query";
import apiClient from "../../../lib/api-client";
import type { LoginRequest, LoginResponse } from "../types/auth";

async function loginApi(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    "/api/v1/auth/login",
    data,
  );
  return response.data;
}

export function useLogin() {
  return useMutation({
    mutationFn: loginApi,
  });
}
