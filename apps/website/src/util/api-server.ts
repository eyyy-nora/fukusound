import { cookies } from "next/headers";
import axios from "axios";

export function apiServer() {
  return axios.create({
    baseURL: "http://localhost:3001",
    headers: {
      cookie: cookies()
        .getAll()
        .map(({ name, value }) => `${name}=${value}`)
        .join(";"),
    },
  });
}
