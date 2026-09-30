/**
 * Network Configuration
 * Configured for Ethereum Sepolia Testnet (Chain ID 11155111).
 * Override any value via the corresponding VITE_* environment variable in .env.local.
 */

export interface NetworkInfo {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  isConfigured: boolean;
}

const envChainId = import.meta.env.VITE_TARGET_CHAIN_ID
  ? parseInt(import.meta.env.VITE_TARGET_CHAIN_ID, 10)
  : 11155111;

export const TARGET_NETWORK: NetworkInfo = {
  chainId: envChainId,
  name: import.meta.env.VITE_NETWORK_NAME || "Ethereum Sepolia",
  rpcUrl:
    import.meta.env.VITE_RPC_URL ||
    "https://eth-sepolia.g.alchemy.com/v2/alch_O3lMUYYKIRtlQdBGpNMCw",
  blockExplorerUrl:
    import.meta.env.VITE_BLOCK_EXPLORER_URL || "https://sepolia.etherscan.io",
  isConfigured: true,
};

export function isTargetNetworkSupported(currentChainId: number | null): boolean {
  if (!currentChainId) return true;
  return currentChainId === TARGET_NETWORK.chainId;
}