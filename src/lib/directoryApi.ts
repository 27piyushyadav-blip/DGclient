import { apiClient } from "./apiClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getExpertsListApi() {
  return apiClient<any>(`${BASE_URL}/directory/experts`, {
    method: "GET",
    skipAuth: true
  });
}

export async function getExpertProfileByIdApi(id: string) {
  try {
    return await apiClient<any>(`${BASE_URL}/directory/experts/${id}`, {
      method: "GET",
      skipAuth: true
    });
  } catch (error: any) {
    if (error.statusCode === 404) return null;
    throw error;
  }
}

export async function getOrganizationsListApi() {
  return apiClient<any>(`${BASE_URL}/directory/organizations`, {
    method: "GET",
    skipAuth: true
  });
}

export async function getOrganizationProfileByIdApi(id: string) {
  try {
    return await apiClient<any>(`${BASE_URL}/directory/organizations/${id}`, {
      method: "GET",
      skipAuth: true
    });
  } catch (error: any) {
    if (error.statusCode === 404) return null;
    throw error;
  }
}

export async function getOrganizationsCategoriesApi() {
  return apiClient<any>(`${BASE_URL}/directory/categories`, {
    method: "GET",
    skipAuth: true
  });
}

export async function getServicesByCategoryApi(category: string) {
  return apiClient<any>(`${BASE_URL}/directory/services/category/${category}`, {
    method: "GET",
    skipAuth: true
  });
}

