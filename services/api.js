import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

/*
=====================================
MINT NFT
=====================================
*/
export const mintNFT = async (payload) => {
  const response = await api.post(
    "/mint",
    payload
  );

  return response.data;
};

/*
=====================================
GET NFT METADATA
=====================================
*/
export const getMetadata = async (
  tokenId
) => {

  const response = await api.get(
    `/metadata/${tokenId}`
  );

  return response.data;
};

/*
=====================================
GET ALL METADATA
=====================================
*/
export const getAllMetadata = async () => {
  const response = await api.get("/metadata");
  return response.data;
};

/*
=====================================
INCREMENT VIEW COUNT
=====================================
*/
export const incrementView = async (
  tokenId
) => {

  const response = await api.post(
    `/metadata/${tokenId}/view`
  );

  return response.data;
};

/*
=====================================
PURCHASE NFT
=====================================
*/
export const purchaseNFT = async (payload) => {
  const response = await api.post("/purchase", payload);
  return response.data;
};

/*
=====================================
UPDATE LISTING
=====================================
*/
export const updateListing = async (payload) => {
  const response = await api.put("/update-listing", payload);
  return response.data;
};

/*
=====================================
TRANSFER NFT
=====================================
*/
export const transferNFT = async (payload) => {
  const response = await api.post("/transfer", payload);
  return response.data;
};

/*
=====================================
GET AUDIT TRAIL
=====================================
*/
export const getAuditTrail = async (tokenId) => {
  const response = await api.get(`/audit-trail/${tokenId}`);
  return response.data;
};

export default api;