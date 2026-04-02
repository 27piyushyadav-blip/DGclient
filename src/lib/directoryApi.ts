const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getExpertsListApi() {
  const url = `${BASE_URL}/directory/experts`;
  
  const response = await fetch(url, {
    method: "GET",
    // We want the directory to be somewhat fresh but cacheable if preferred. Look at page.tsx config.
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch experts: ${response.status}`);
  }

  return response.json();
}

export async function getExpertProfileByIdApi(id: string) {
  const url = `${BASE_URL}/directory/experts/${id}`;
  
  const response = await fetch(url, {
    method: "GET",
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch expert profile: ${response.status}`);
  }

  return response.json();
}

export async function getOrganizationsListApi() {
  const url = `${BASE_URL}/directory/organizations`;
  
  const response = await fetch(url, {
    method: "GET",
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch organizations: ${response.status}`);
  }

  return response.json();
}

export async function getOrganizationProfileByIdApi(id: string) {
  const url = `${BASE_URL}/directory/organizations/${id}`;
  
  const response = await fetch(url, {
    method: "GET",
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch organization profile: ${response.status}`);
  }

  return response.json();
}
