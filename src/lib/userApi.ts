import { apiClient } from "./apiClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getUserProfileApi() {
  return apiClient<any>(`${BASE_URL}/users/profile`, {
    method: 'GET',
    cache: 'no-store', // Prevent NextJS caching 401s
  });
}

export async function updateUserProfileApi(updateData: any) {
  return apiClient<any>(`${BASE_URL}/users/profile`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

export async function uploadUserProfileImageApi(file: File) {
  const formData = new FormData();
  formData.append('image', file);

  return apiClient<any>(`${BASE_URL}/users/profile/image`, {
    method: 'POST',
    body: formData,
  });
}
