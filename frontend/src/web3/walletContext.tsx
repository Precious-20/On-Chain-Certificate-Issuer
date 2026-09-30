import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import type { WalletState } from "../contracts/types";
import { getBrowserProvider, getInjectedEthereum, getReadOnlyProvider, hasEthereumProvider } from "./provider";
import { isTargetNetworkSupported, TARGET_NETWORK } from "../config/networkConfig";
import { isContractConfigured } from "../config/contractConfig";
import { checkIsAuthorizedIssuerOnChain, fetchContractOwnerOnChain } from "./reads";

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
  getSigner: () => Promise<ethers.Signer | null>;
  getProvider: () => ethers.BrowserProvider | null;
  refreshPermissions: () => Promise<void>;
  clearError: () => void;
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
  switchNetwork: async () => {},
  getSigner: async () => null,
  getProvider: () => null,
  refreshPermissions: async () => {},
  clearError: () => {},
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WalletState>(initialWalletState);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

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
    if (!state.address || !isContractConfigured()) {
      return;
    }

    try {
      const provider = getProvider() || (await getReadOnlyProvider(TARGET_NETWORK.rpcUrl));
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
      console.warn("Could not fetch contract permissions", err);
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
          // Contract read failed silently
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
      let friendlyError = err.message || "Failed to connect wallet.";
      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        friendlyError = "Wallet connection rejected by user.";
      } else if (err.code === -32002) {
        friendlyError = "MetaMask notification is already pending. Please open your wallet extension to approve.";
      }

      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: friendlyError,
      }));
    }
  };

  const switchNetwork = async () => {
    const ethereum = getInjectedEthereum();
    if (!ethereum) return;
    const targetChainIdHex = `0x${TARGET_NETWORK.chainId.toString(16)}`;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainIdHex }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: targetChainIdHex,
                chainName: TARGET_NETWORK.name,
                rpcUrls: [TARGET_NETWORK.rpcUrl],
                blockExplorerUrls: [TARGET_NETWORK.blockExplorerUrl],
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError: any) {
          setState((prev) => ({
            ...prev,
            error: addError.message || "Failed to add Sepolia network to wallet.",
          }));
        }
      } else {
        setState((prev) => ({
          ...prev,
          error: switchError.message || "Failed to switch network.",
        }));
      }
    }
  };

  const disconnectWallet = () => {
    setState(initialWalletState);
  };

  // Auto-connect check on initial mount
  useEffect(() => {
    const ethereum = getInjectedEthereum();
    if (!ethereum) return;

    ethereum
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          const provider = getBrowserProvider();
          if (provider) {
            updateNetworkState(provider, ethers.getAddress(accounts[0]));
          }
        }
      })
      .catch((err: any) => {
        console.warn("Silent account check failed", err);
      });
  }, [updateNetworkState]);

  // EIP-1193 event listeners
  useEffect(() => {
    const ethereum = getInjectedEthereum();
    if (!ethereum) return;

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

    if (ethereum.on) {
      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [state.address, updateNetworkState]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        getSigner,
        getProvider,
        refreshPermissions,
        clearError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);