import { request } from "./http";
import type { Sale, SaleLine } from "../types";

export const getSales = () => request<Sale[]>("/api/sales");

export const createSale = (items: SaleLine[]) =>
  request<Sale>("/api/sales", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
