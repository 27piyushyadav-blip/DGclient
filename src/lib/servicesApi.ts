import { apiClient } from "./apiClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface CategoryOrganization {
  _id: string;
  userId: string;
  name: string;
  subdomain: string;
  location: string;
  logo: string;
  verified: boolean;
  rating: number;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string | null;
  price: string | null;
  durationMinutes?: number;
  organization: CategoryOrganization;
}

export type Service = Category;

export interface CategoriesResponse {
  status: string;
  data: {
    categories: Category[];
  };
}

export interface ServicesByCategoryResponse {
  status: string;
  data: {
    services?: Service[];
    categories?: Service[];
  };
}

export async function getCategoriesApi() {
  return apiClient<CategoriesResponse>(`${BASE_URL}/directory/categories`, {
    method: "GET",
    skipAuth: true,
  });
}

export async function getServicesByCategoryApi(category: string) {
  return apiClient<ServicesByCategoryResponse>(
    `${BASE_URL}/directory/services/category/${encodeURIComponent(category)}`,
    {
      method: "GET",
      skipAuth: true,
    },
  );
}
