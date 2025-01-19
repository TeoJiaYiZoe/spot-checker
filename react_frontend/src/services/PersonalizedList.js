import { spotCheckerAxiosWrapper } from "./_axios";

async function getPersonalizedList(eid) {
  const { spotCheckerGet } = spotCheckerAxiosWrapper();
  const targetUrl = `/observations/get-check-check-list/${eid}`;
  const response = await spotCheckerGet(targetUrl, {
    withCredentials: true,  // This ensures cookies are sent
  });
  return response?.data;
}

export { getPersonalizedList };
