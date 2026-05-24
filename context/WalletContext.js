"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

import {
  connectWallet
} from "../services/wallet";

const WalletContext =
  createContext();

export const WalletProvider = ({
  children
}) => {

  const [wallet, setWallet] =
    useState(null);

  const login = async () => {
    const data = await connectWallet();
    if (data) {
      setWallet(data);
    }
  };

  const logout = () => {
    setWallet(null);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          // If already logged in, update the wallet data
          const data = await connectWallet();
          if (data) {
            setWallet(data);
          }
        } else {
          setWallet(null); // User disconnected all accounts
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{ wallet, login, logout }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () =>
  useContext(WalletContext);