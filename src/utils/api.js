const API_BASE_URL = process.env.NEXT_PUBLIC_NODE_API_BASE_URL || "http://localhost:5000";

// Timeout Fetch with Retry
export async function fetchWithTimeout(resource, options = {}, timeout = 10000, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(resource, {
        ...options,
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(id);
      return res; // Success
    } catch (err) {
      clearTimeout(id);

      if (err.name === "AbortError") {
        console.warn(`Request aborted due to timeout (Attempt ${attempt})`);
      } else {
        console.warn(`Fetch error: ${err.message} (Attempt ${attempt})`);
      }

      if (attempt === retries) {
        if (err.name === "AbortError") {
          return { aborted: true };
        }
        throw err;
      }

      await new Promise((res) => setTimeout(res, 500 * attempt));
    }
  }
}

// Unified error handler
async function handleResponse(res) {
  if (res?.aborted) {
    return { aborted: true };
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = {
      status: res.status,
      data: data,
      message: data?.message || `Error: ${res.statusText}`,
    };
    throw error;
  }

  return data;
}

// GET
export async function fetchData(endpoint, token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetchWithTimeout(`${API_BASE_URL}/${endpoint}`, { headers });
  return handleResponse(res);
}

// POST
export async function postData(endpoint, data, token = null, isFormData = false) {
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      }
    : { "Content-Type": "application/json" };

  const res = await fetchWithTimeout(`${API_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });

  return handleResponse(res);
}

// PUT
export async function updateData(endpoint, data, token = null, isFormData = false) {
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      }
    : { "Content-Type": "application/json" };

  const res = await fetchWithTimeout(`${API_BASE_URL}/${endpoint}`, {
    method: "PUT",
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });

  return handleResponse(res);
}

// DELETE
export async function deleteData(endpoint, token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetchWithTimeout(`${API_BASE_URL}/${endpoint}`, {
    method: "DELETE",
    headers,
  });

  return handleResponse(res);
}
