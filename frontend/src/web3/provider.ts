import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function hasEthereumProvider(): boolean {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
}

export function getBrowserProvider(): ethers.BrowserProvider | null {
  if (!hasEthereumProvider()) {
    return null;
  }
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getReadOnlyProvider(rpcUrl?: string): Promise<ethers.Provider> {
  if (rpcUrl && rpcUrl !== "TBD") {
    return new ethers.JsonRpcProvider(rpcUrl);
  }
  
  if (hasEthereumProvider()) {
    return new ethers.BrowserProvider(window.ethereum);
  }

  // Return fallback default provider if available or throwing informative error when called
  throw new Error("No Web3 provider available. Please connect a browser wallet like MetaMask.");
}
