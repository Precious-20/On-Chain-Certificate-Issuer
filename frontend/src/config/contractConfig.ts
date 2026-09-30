/**
 * Contract Configuration
 * Configured for the deployed CertificateIssuer on Ethereum Sepolia Testnet.
 * Override via VITE_CONTRACT_ADDRESS in .env.local if needed.
 */

export const CONTRACT_ADDRESS = (
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0x74B78BD8F0EF1931F8cD869c2d55055b1906b03C"
).trim();

export function isContractConfigured(): boolean {
  return (
    typeof CONTRACT_ADDRESS === "string" &&
    CONTRACT_ADDRESS.length === 42 &&
    CONTRACT_ADDRESS.startsWith("0x") &&
    CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000"
  );
}