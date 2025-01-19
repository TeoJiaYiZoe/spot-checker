import axios from "axios";
const spotCheckerAxiosWrapper = () => {
  const spotCheckerAxios = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true
  });

  // Configure Axios instance request handling
  spotCheckerAxios.interceptors.request.use(
    (request) => request,
    (error) => Promise.reject(error)
  );

  // Configure Axios instance response handling
  spotCheckerAxios.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );


  const spotCheckerGet = async (path) => {
    try {
      const responseData = await spotCheckerAxios.get(path, {
        withCredentials: true,
      });
      return responseData;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const spotCheckerPost = async (path, reqBody = {}) => {
    try {
      const responseData = await spotCheckerAxios.post(path, reqBody, {
        withCredentials: true,
      });
      return responseData;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  return {
    spotCheckerGet,
    spotCheckerPost,
  };
};

export default spotCheckerAxiosWrapper;
