const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getUserProfileApi(headers: HeadersInit) {
  const response = await fetch(`${BASE_URL}/users/profile`, {
    method: 'GET',
    cache: 'no-store', // Prevent NextJS caching 401s
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Status ${response.status}: ${data.message || 'Failed to fetch user profile'}`);
  }

  return data;
}

export async function updateUserProfileApi(updateData: any, headers: HeadersInit) {
  const response = await fetch(`${BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(updateData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }

  return data;
}

export async function uploadUserProfileImageApi(file: File, headers: HeadersInit) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${BASE_URL}/users/profile/image`, {
    method: 'POST',
    headers: headers, // Do not set Content-Type here, let the browser set it with the boundary
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload profile image');
  }

  return data;
}
