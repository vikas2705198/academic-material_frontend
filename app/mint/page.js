"use client";

import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useWallet } from "../../context/WalletContext";

import { mintNFT } from "../../services/api";

export default function MintPage() {
  const router = useRouter();
  const { wallet } = useWallet();
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [loading, setLoading] = useState(false);

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
        <Navbar />
        <div className="flex flex-col items-center justify-center mt-32">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 text-lg">Please connect your MetaMask wallet to upload documents.</p>
        </div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewURL(URL.createObjectURL(selectedFile));
    }
  };

  const handleMint = async () => {
    if (!file) {
      toast.error("Please select a file.");
      return;
    }

    try {
      setLoading(true);

      // 1. Upload to Pinata
      const formData = new FormData();
      formData.append("file", file);

      const pinataMetadata = JSON.stringify({
        name: file.name,
      });
      formData.append("pinataMetadata", pinataMetadata);

      const pinataOptions = JSON.stringify({
        cidVersion: 0,
      });
      formData.append("pinataOptions", pinataOptions);

      toast.loading("Uploading to IPFS...", { id: "mint" });

      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
        body: formData,
      });

      const resData = await res.json();

      if (!res.ok) {
        const errorMsg = resData.error?.details || resData.error || "Failed to upload to IPFS";
        if (typeof errorMsg === 'string' && errorMsg.includes("token is malformed")) {
          throw new Error("Invalid Pinata JWT. Please make sure you copied the long JWT token (starting with 'eyJ...') and restart your Next.js server.");
        }
        throw new Error(errorMsg);
      }

      const ipfsHash = resData.IpfsHash;
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      toast.loading("Saving to database...", { id: "mint" });

      // 2. Send IPFS URL to backend
      const payload = {
        tokenURI: ipfsUrl,
        userAddress: wallet.address
      };

      const response = await mintNFT(payload);

      toast.success("Document Uploaded & Saved Successfully", { id: "mint" });
      console.log(response);

      // Reset form
      setFile(null);
      setPreviewURL("");

      // Redirect to marketplace
      router.push("/marketplace");

    } catch (error) {
      console.error(error);
      toast.error(error.message || error.response?.data?.error || "Mint failed", { id: "mint" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <Navbar />
      <Toaster />

      <div className="max-w-2xl mx-auto mt-12 bg-white shadow-xl p-8 rounded-2xl border border-gray-100 transition-all">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          Upload Document
        </h1>

        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="flex flex-col items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer bg-gray-50 border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 overflow-hidden relative group shadow-inner">
              {file ? (
                <div className="absolute inset-0 w-full h-full p-4 flex flex-col items-center justify-center bg-white rounded-2xl">
                  {file.type.startsWith("image/") ? (
                    <img
                      src={previewURL}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-xl shadow-sm"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 bg-blue-100 rounded-full shadow-inner">
                        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-800 font-semibold text-lg truncate max-w-[250px]">{file.name}</p>
                        <p className="text-blue-500 font-medium text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl backdrop-blur-[2px]">
                    <span className="text-white font-semibold text-sm tracking-wide px-5 py-2.5 bg-black bg-opacity-60 rounded-xl shadow-xl transform group-hover:scale-105 transition-transform">Change File</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-4 bg-gray-100 group-hover:bg-blue-100 rounded-full mb-4 transition-colors duration-300 shadow-sm">
                    <svg className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                  </div>
                  <p className="mb-2 text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-300"><span className="font-semibold text-gray-700 group-hover:text-blue-700">Click to browse</span> or drag and drop</p>
                  <p className="text-xs text-gray-400 font-medium">PDF, DOC, TXT, PNG, JPG (Max 10MB)</p>
                </div>
              )}
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleMint}
            disabled={loading}
            className={`w-full text-lg font-semibold text-white px-6 py-4 rounded-xl transition-all shadow-md ${
              loading 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              "Upload Document"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
