import { ethers } from "ethers";

export const connectWallet = async () => {

  try {

    /*
    =====================================
    CHECK METAMASK
    =====================================
    */

    if (!window.ethereum) {

      alert(
        "Please install MetaMask"
      );

      return null;
    }

    /*
    =====================================
    REQUEST ACCOUNT
    =====================================
    */

    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [
        {
          eth_accounts: {}
        }
      ]
    });

    /*
    =====================================
    ETHERS V6 PROVIDER
    =====================================
    */

    const provider =
      new ethers.BrowserProvider(
        window.ethereum
      );

    /*
    =====================================
    SIGNER
    =====================================
    */

    const signer =
      await provider.getSigner();

    /*
    =====================================
    ADDRESS
    =====================================
    */

    const address =
      await signer.getAddress();

    return {

      provider,

      signer,

      address
    };

  } catch (error) {

    console.log(error);

    return null;
  }
};