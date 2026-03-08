"use server";

import { cache } from "react";
import { apiJsonRequest } from "@/lib/api/client";
import type StoreInfo from "@/types/StoreInfo";

type CompleteStoreInfo = StoreInfo & {
    name: string;
    headline: string;
    description: string;
    copyright: string;
};

export async function getStoreInfoUncached(): Promise<CompleteStoreInfo> {
    return apiJsonRequest<CompleteStoreInfo>("/store-info");
}

export const getStoreInfo = cache(getStoreInfoUncached);
