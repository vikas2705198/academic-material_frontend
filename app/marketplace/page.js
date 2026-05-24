"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { getAllMetadata } from "../../services/api";
import { useWallet } from "../../context/WalletContext";

export default function MarketplacePage() {
  const router = useRouter();
  const { wallet } = useWallet();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getAllMetadata();
        // Filter items to only show NFTs owned by the currently connected wallet
        const userItems = data.filter(
          item => item.ownerAddress && item.ownerAddress.toLowerCase() === wallet.address.toLowerCase()
        );
        setItems(userItems);
      } catch (error) {
        console.error("Failed to fetch marketplace items:", error);
      } finally {
        setLoading(false);
      }
    };
    if (wallet) {
      fetchItems();
    }
  }, [wallet]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    // Check if the date is a Unix timestamp in seconds (e.g. from Solidity block.timestamp)
    let timestamp = Number(dateString);
    if (!isNaN(timestamp) && timestamp < 10000000000) {
      timestamp *= 1000; // Convert to milliseconds
    } else {
      timestamp = dateString; // Fallback to original if it's a date string
    }

    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(timestamp).toLocaleDateString(undefined, options);
  };

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
        <Navbar />
        <div className="flex flex-col items-center justify-center mt-32">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 text-lg">Please connect your MetaMask wallet to view the marketplace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <Navbar />
      <div className="p-8 max-w-7xl mx-auto mt-6">
        <h1 className="text-5xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          Document Marketplace
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-xl text-gray-500 bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
            No documents available yet. Mint one to see it here!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => {
              const url = item.ipfsUrl || item.tokenURI;
              return (
                <div key={item.tokenId} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Token #{item.tokenId}
                      </span>
                      <div className="flex items-center text-gray-500 text-sm font-medium">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {item.viewCount || 0}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Mint Date</p>
                        <p className="text-sm font-medium text-gray-800">
                          {formatDate(item.mintTimestamp || item.createdAt)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">IPFS Link</p>
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate block hover:underline transition-colors"
                          title={url}
                        >
                          {url ? (url.length > 40 ? url.substring(0, 40) + "..." : url) : "No link available"}
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      sessionStorage.setItem("selectedTokenId", item.tokenId);
                      router.push("/material/details");
                    }}
                    className="block text-center bg-gray-50 text-blue-600 font-semibold px-4 py-3 w-full rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 border border-gray-100 group-hover:border-blue-600"
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
