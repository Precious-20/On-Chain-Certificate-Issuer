import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import type { WalletState } from "../contracts/types";
import { getBrowserProvider, hasEthereumProvider } from "./provider";
import { isTargetNetworkSupported } from "../config/networkConfig";
import { isContractConfigured } from "../config/contractConfig";
import { checkIsAuthorizedIssuerOnChain, fetchContractOwnerOnChain } from "./reads";

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getSigner: () => Promise<ethers.Signer | null>;
  getProvider: () => ethers.BrowserProvider | null;
  refreshPermissions: () => Promise<void>;
}

const initialWalletState: WalletState = {
  address: null,
  isConnected: false,
  isConnecting: false,
  chainId: null,
  chainName: null,
  isSupportedNetwork: true,
  ownerAddress: null,
  isOwner: false,
  isIssuer: false,
  error: null,
};

const WalletContext = createContext<WalletContextType>({
  ...initialWalletState,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  getSigner: async () => null,
  getProvider: () => null,
  refreshPermissions: async () => {},
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WalletState>(initialWalletState);

  const getProvider = useCallback((): ethers.BrowserProvider | null => {
    return getBrowserProvider();
  }, []);

  const getSigner = useCallback(async (): Promise<ethers.Signer | null> => {
    const provider = getProvider();
    if (!provider) return null;
    try {
      return await provider.getSigner();
    } catch {
      return null;
    }
  }, [getProvider]);

  const refreshPermissions = useCallback(async () => {
    const provider = getProvider();
    if (!provider || !state.address || !isContractConfigured()) {
      return;
    }

    try {
      const owner = await fetchContractOwnerOnChain(provider);
      const isOwner = owner.toLowerCase() === state.address.toLowerCase();
      let isIssuer = isOwner;
      if (!isOwner) {
        isIssuer = await checkIsAuthorizedIssuerOnChain(provider, state.address);
      }

      setState((prev) => ({
        ...prev,
        ownerAddress: owner,
        isOwner,
        isIssuer,
      }));
    } catch (err) {
      console.warn("Could not fetch contract permissions (contract may be unconfigured or un-deployed)", err);
    }
  }, [getProvider, state.address]);

  const updateNetworkState = useCallback(async (provider: ethers.BrowserProvider, userAddress: string) => {
    try {
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const chainName = network.name !== "unknown" ? network.name : `Chain ID ${chainId}`;
      const isSupported = isTargetNetworkSupported(chainId);

      let ownerAddr: string | null = null;
      let isOwner = false;
      let isIssuer = false;

      if (isContractConfigured()) {
        try {
          ownerAddr = await fetchContractOwnerOnChain(provider);
          isOwner = ownerAddr.toLowerCase() === userAddress.toLowerCase();
          if (isOwner) {
            isIssuer = true;
          } else {
            isIssuer = await checkIsAuthorizedIssuerOnChain(provider, userAddress);
          }
        } catch (e) {
          // Contract read failed
        }
      }

      setState({
        address: userAddress,
        isConnected: true,
        isConnecting: false,
        chainId,
        chainName,
        isSupportedNetwork: isSupported,
        ownerAddress: ownerAddr,
        isOwner,
        isIssuer,
        error: null,
      });
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: err?.message || "Failed to query network status.",
      }));
    }
  }, []);

  const connectWallet = async () => {
    if (!hasEthereumProvider()) {
      setState((prev) => ({
        ...prev,
        error: "No Ethereum wallet detected. Please install MetaMask or another Web3 browser extension.",
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isConnecting: true, error: null }));
      const provider = getBrowserProvider();
      if (!provider) throw new Error("Web3 provider not available.");

      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts retrieved from wallet.");
      }

      const userAddress = ethers.getAddress(accounts[0]);
      await updateNetworkState(provider, userAddress);
    } catch (err: any) {
      const friendlyError = err.code === 4001 || err.code === "ACTION_REJECTED"
        ? "Wallet connection rejected by user."
        : err.message || "Failed to connect wallet.";

      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: friendlyError,
      }));
    }
  };

  const disconnectWallet = () => {
    setState(initialWalletState);
  };

  // EIP-1193 listeners
  useEffect(() => {
    if (!hasEthereumProvider() || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        const provider = getBrowserProvider();
        if (provider) {
          updateNetworkState(provider, ethers.getAddress(accounts[0]));
        }
      }
    };

    const handleChainChanged = () => {
      if (state.address) {
        const provider = getBrowserProvider();
        if (provider) {
          updateNetworkState(provider, state.address);
        }
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [state.address, updateNetworkState]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connectWallet,
        disconnectWallet,
        getSigner,
        getProvider,
        refreshPermissions,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
