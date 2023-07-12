import { createMount } from "@propero/easy-api";
import { Router } from "express";

export const apiRouter = Router();
export const Mount = createMount(apiRouter);
