import { apiFetch } from "../api";

export async function getBlogs() {
  return apiFetch("/api/blogs");
}

export async function getBlogBySlug(slug: string) {
  return apiFetch(`/api/blogs/${slug}`);
}

export async function getBlogComments(slug: string) {
  return apiFetch(`/api/blogs/${slug}/comments`);
}

export async function postBlogComment(slug: string, payload: unknown) {
  return apiFetch(`/api/blogs/${slug}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function viewBlog(slug: string) {
  return apiFetch(`/api/blogs/${slug}/view`, {
    method: "POST",
  });
}

export async function likeBlog(slug: string, liked: boolean) {
  return apiFetch(`/api/blogs/${slug}/like`, {
    method: "POST",
    body: JSON.stringify({ liked }),
  });
}

export async function getAdminBlogs() {
  return apiFetch("/admin/api/blogs");
}

export async function createBlog(data: unknown) {
  return apiFetch("/admin/api/blogs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBlog(
  id: number,
  data: unknown
) {
  return apiFetch(`/admin/api/blogs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteBlog(id: number) {
  return apiFetch(`/admin/api/blogs/${id}`, {
    method: "DELETE",
  });
}