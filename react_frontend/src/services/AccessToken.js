import { spotCheckerAxiosWrapper } from "./_axios";

async function getAccessToken() {
  const { spotCheckerGet } = spotCheckerAxiosWrapper();
  const targetUrl = `/auth/api/access-token`;
  const response = await spotCheckerGet(targetUrl, {
    withCredentials: true,
  },
);
  return response?.data;
}

export { getAccessToken };
