import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function hasEthereumProvider(): boolean {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
}

export function getInjectedEthereum(): any {
  if (!hasEthereumProvider()) return null;
  const ethereum = window.ethereum;
  if (ethereum?.providers?.length) {
    const metaMaskProvider = ethereum.providers.find((p: any) => p.isMetaMask);
    return metaMaskProvider || ethereum.providers[0];
  }
  return ethereum;
}

export function getBrowserProvider(): ethers.BrowserProvider | null {
  const ethereum = getInjectedEthereum();
  if (!ethereum) {
    return null;
  }
  return new ethers.BrowserProvider(ethereum);
}

const FALLBACK_RPC_URL =
  "https://eth-sepolia.g.alchemy.com/v2/alch_O3lMUYYKIRtlQdBGpNMCw";

export async function getReadOnlyProvider(rpcUrl?: string): Promise<ethers.Provider> {
  const url = rpcUrl && rpcUrl !== "TBD" ? rpcUrl : FALLBACK_RPC_URL;
  return new ethers.JsonRpcProvider(url);
}