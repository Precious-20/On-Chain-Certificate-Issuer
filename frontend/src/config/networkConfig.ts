/**
 * Network Configuration
 * 
 * IMPORTANT:
 * Do not hardcode a network or chain ID.
 * Network parameters will be provided by Team A upon contract deployment.
 */

export interface NetworkInfo {
  chainId: number | null;
  name: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  isConfigured: boolean;
}

const envChainId = import.meta.env.VITE_TARGET_CHAIN_ID
  ? parseInt(import.meta.env.VITE_TARGET_CHAIN_ID, 10)
  : null;

export const TARGET_NETWORK: NetworkInfo = {
  chainId: envChainId,
  name: import.meta.env.VITE_NETWORK_NAME || "TBD (Pending Team A Deployment)",
  rpcUrl: import.meta.env.VITE_RPC_URL || "TBD",
  blockExplorerUrl: import.meta.env.VITE_BLOCK_EXPLORER_URL || "TBD",
  isConfigured: envChainId !== null,
};

export function isTargetNetworkSupported(currentChainId: number | null): boolean {
  if (!TARGET_NETWORK.isConfigured) {
    // If target chain ID is not strictly set yet, accept any active network connection
    return true;
  }
  return currentChainId === TARGET_NETWORK.chainId;
}
