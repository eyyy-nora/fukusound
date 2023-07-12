import axios, { AxiosInstance } from "axios";

let client: AxiosInstance;
export function apiClient() {
  return (client ??= axios.create({
    baseURL: "/api",
  }));
}
