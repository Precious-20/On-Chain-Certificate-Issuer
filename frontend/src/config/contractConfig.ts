/**
 * Contract Configuration
 * 
 * IMPORTANT:
 * Do not hardcode a fake contract address.
 * Team A will provide the deployed contract address once deployed to the target network.
 * You can configure it via environment variable `VITE_CONTRACT_ADDRESS` or update `CONTRACT_ADDRESS` below.
 */

export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || "").trim();

export function isContractConfigured(): boolean {
  return (
    typeof CONTRACT_ADDRESS === "string" &&
    CONTRACT_ADDRESS.length === 42 &&
    CONTRACT_ADDRESS.startsWith("0x") &&
    CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000"
  );
}

export const CONTRACT_CONFIG_PLACEHOLDER = {
  address: CONTRACT_ADDRESS || "TBD (Awaiting deployment by Team A)",
  status: isContractConfigured() ? "Configured" : "Unset",
};
