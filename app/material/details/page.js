"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import { getMetadata, transferNFT, getAuditTrail, incrementView } from "../../../services/api";
import { useWallet } from "../../../context/WalletContext";

export default function MaterialPage() {
  const router = useRouter();
  const [tokenId, setTokenId] = useState(null);

  useEffect(() => {
    const id = sessionStorage.getItem("selectedTokenId");
    if (id) {
      setTokenId(id);
    } else {
      router.push("/marketplace");
    }
  }, [router]);
  
  const [data, setData] = useState(null);
  const [auditTrail, setAuditTrail] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [transferTo, setTransferTo] = useState("");
  const [transferring, setTransferring] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current || !tokenId) return;
    hasFetched.current = true;

    const fetchMaterial = async () => {
      try {
        const response = await getMetadata(tokenId);
        setData(response);
        
        try {
          const auditResponse = await getAuditTrail(tokenId);
          setAuditTrail(auditResponse.auditTrail);
        } catch(e) {
          console.error("Audit trail error", e);
        }
        
        try {
          const viewData = await incrementView(tokenId);
          if (viewData && viewData.viewCount) {
            setData(prev => prev ? { ...prev, viewCount: viewData.viewCount } : prev);
          }
        } catch (e) {
          console.error("Failed to increment view count", e);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchMaterial();
  }, [tokenId]);

  const { wallet } = useWallet();

  const handleTransfer = async () => {
    if (!transferTo) return;
    setTransferring(true);
    try {
      if (transferTo.toLowerCase() === data.ownerAddress.toLowerCase()) {
        alert("This NFT is already owned by that address!");
        setTransferring(false);
        return;
      }

      if (wallet && data && data.ownerAddress && wallet.address.toLowerCase() === data.ownerAddress.toLowerCase()) {
        // User owns the NFT, transfer via MetaMask
        const { ethers } = await import("ethers");
        const abi = ["function transferFrom(address from, address to, uint256 tokenId) public"];
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        const contract = new ethers.Contract(contractAddress, abi, wallet.signer);
        
        const tx = await contract.transferFrom(wallet.address, transferTo, tokenId);
        await tx.wait();
        
        // Notify backend that on-chain transfer is done
        await transferNFT({ tokenId, toAddress: transferTo, onChainDone: true });
      } else {
        // Fallback to backend transfer (only works if backend owns it)
        await transferNFT({ tokenId, toAddress: transferTo });
      }

      alert("Transfer successful!");
      // Redirect to marketplace
      router.push("/marketplace");
    } catch (error) {
      console.error(error);
      const serverMsg = error.response?.data?.error;
      alert("Transfer failed: " + (serverMsg || error.message || "Unknown error"));
    } finally {
      setTransferring(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    // Check if the date is a Unix timestamp in seconds (e.g. from Solidity block.timestamp)
    let timestamp = Number(dateString);
    if (!isNaN(timestamp) && timestamp < 10000000000) {
      timestamp *= 1000; // Convert to milliseconds
    } else {
      timestamp = dateString; // Fallback to original if it's a date string
    }

    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(timestamp).toLocaleDateString(undefined, options);
  };

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
        <Navbar />
        <div className="flex flex-col items-center justify-center mt-32">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 text-lg">Please connect your MetaMask wallet to view material details.</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 pb-12 flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const url = data.ipfsUrl || data.tokenURI;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <Navbar />
      
      <div className="max-w-3xl mx-auto mt-12 bg-white shadow-2xl p-10 rounded-3xl border border-gray-100 relative overflow-hidden">
        
        {/* Decorative Background blob */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-100 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          
          <Link href="/marketplace" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 mb-8 transition-colors group">
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Marketplace
          </Link>

          <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                Material Details
              </h1>
              <p className="text-gray-500 font-medium">Token ID <span className="text-blue-600 font-bold">#{data.tokenId}</span></p>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold flex items-center shadow-sm">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {data.viewCount || 0} Views
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Mint Date
              </p>
              <p className="text-lg font-semibold text-gray-800">
                {formatDate(data.mintTimestamp || data.createdAt)}
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Owner
              </p>
              <p className="text-lg font-semibold text-gray-800 truncate" title={data.ownerAddress}>
                {data.ownerAddress ? `${data.ownerAddress.substring(0, 6)}...${data.ownerAddress.substring(data.ownerAddress.length - 4)}` : "Unknown"}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8">
            <p className="text-sm text-blue-600 uppercase font-bold tracking-wider mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              IPFS Document Link
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-blue-700 hover:text-blue-900 break-all hover:underline transition-colors block"
            >
              {url || "No link available"}
            </a>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Transfer NFT</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="New Owner Address (0x...)"
                className="flex-grow px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
              />
              <button
                onClick={handleTransfer}
                disabled={transferring || !transferTo}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl disabled:opacity-50 transition-colors"
              >
                {transferring ? "Transferring..." : "Transfer"}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-8 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Audit Trail History
              </h3>
              <p className="text-sm text-gray-500 mt-1">View the complete blockchain transfer history for this material.</p>
            </div>
            <button 
              onClick={() => setIsAuditModalOpen(true)}
              className="bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-700 font-semibold py-2.5 px-6 rounded-xl transition-colors whitespace-nowrap shadow-sm"
            >
              View History
            </button>
          </div>

        </div>
      </div>

      {/* Audit Trail Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Audit Trail History
              </h3>
              <button onClick={() => setIsAuditModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-gray-50">
              {auditTrail && auditTrail.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-4 text-left">Activity</th>
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-left">From Address</th>
                        <th className="py-3 px-4 text-left">To Address</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                      {auditTrail.map((record, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap font-semibold text-gray-800">
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              record.activity === "Mint NFT" ? "bg-green-100 text-green-700" :
                              record.activity === "Transfer NFT" ? "bg-blue-100 text-blue-700" :
                              record.activity === "View NFT" ? "bg-purple-100 text-purple-700" :
                              record.activity === "List NFT" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {record.activity}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-gray-500 font-medium">{formatDate(record.date)}</td>
                          <td className="py-3 px-4 font-mono text-xs">{record.fromAddress === "-" ? <span className="text-gray-400">-</span> : record.fromAddress}</td>
                          <td className="py-3 px-4 font-mono text-xs">{record.toAddress === "-" ? <span className="text-gray-400">-</span> : record.toAddress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                  <p className="text-lg text-gray-500 font-medium">No audit trail available for this NFT.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
              <button onClick={() => setIsAuditModalOpen(false)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}