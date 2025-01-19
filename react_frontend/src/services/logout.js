import { spotCheckerAxiosWrapper } from "./_axios";

async function logout() {
  const { spotCheckerPost } = spotCheckerAxiosWrapper();

  const targetUrl = `/auth/logout`;
  const response = await spotCheckerPost(targetUrl, null);
  return response?.data;
}

export { logout };
