"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "../context/WalletContext";

export default function Navbar() {
  const { wallet, login, logout } = useWallet();
  const pathname = usePathname();

  const isActive = (path) => pathname === path ? "text-blue-600 bg-blue-50 font-semibold" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50 font-medium";

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
              Academic NFT
            </Link>
          </div>

          {/* Navigation Links & Wallet */}
          <div className="flex items-center gap-2 md:gap-6">
            
            {wallet && (
              <div className="hidden md:flex items-center gap-1 mr-4">
                <Link href="/" className={`px-4 py-2 rounded-xl transition-all duration-200 ${isActive("/")}`}>
                  Home
                </Link>
                <Link href="/mint" className={`px-4 py-2 rounded-xl transition-all duration-200 ${isActive("/mint")}`}>
                  Mint
                </Link>
                <Link href="/marketplace" className={`px-4 py-2 rounded-xl transition-all duration-200 ${isActive("/marketplace")}`}>
                  Marketplace
                </Link>
              </div>
            )}

            {wallet ? (
              <div className="flex gap-2 md:gap-3 items-center">
                <div className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 md:px-4 md:py-2 rounded-xl font-medium shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
                  <span className="sm:hidden">{wallet.address.slice(0, 4)}..</span>
                </div>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-red-500 hover:bg-red-50 px-3 py-2 md:px-4 md:py-2 rounded-xl font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <svg className="w-5 h-5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                Connect Wallet
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile menu links when connected */}
        {wallet && (
          <div className="md:hidden flex justify-around border-t border-gray-100 py-3">
            <Link href="/" className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${isActive("/")}`}>
              Home
            </Link>
            <Link href="/mint" className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${isActive("/mint")}`}>
              Mint
            </Link>
            <Link href="/marketplace" className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${isActive("/marketplace")}`}>
              Marketplace
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}