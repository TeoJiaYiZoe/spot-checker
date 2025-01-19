  import { spotCheckerAxiosWrapper } from "./_axios";

  async function login(eid, passwordHash) {
    const { spotCheckerPost } = spotCheckerAxiosWrapper();

    const targetUrl = `/auth/login`;
    const response = await spotCheckerPost(targetUrl, {
      eid,
      passwordHash,
    });
    return response?.data;
  }

  export { login };
