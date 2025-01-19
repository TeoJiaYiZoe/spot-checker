import { spotCheckerAxiosWrapper } from "./_axios";

async function addObservation(licenseNo, formData) {
  const { spotCheckerPost } = spotCheckerAxiosWrapper();

  const targetUrl = `/observations/add-observation/${licenseNo}`;
  const response = await spotCheckerPost(targetUrl, formData,{
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response?.data;
}

async function getObservations(licenseNo) {
  const { spotCheckerGet } = spotCheckerAxiosWrapper();

  const targetUrl = `/observations/get-observations/${licenseNo}`;
  const response = await spotCheckerGet(targetUrl);
  return response?.data;
}

export { addObservation, getObservations };
