import { ethers } from "ethers";
import { CONTRACT_ADDRESS, isContractConfigured } from "../config/contractConfig";
import { CERTIFICATE_ISSUER_ABI } from "../contracts/CertificateIssuerABI";

function getWriteContractInstance(signer: ethers.Signer): ethers.Contract {
  if (!isContractConfigured()) {
    throw new Error(
      "Contract Not Configured: Deployed contract address is not set yet. Awaiting deployment from Team A."
    );
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CERTIFICATE_ISSUER_ABI, signer);
}

/**
 * Issue a new certificate on-chain
 */
export async function issueCertificateOnChain(
  signer: ethers.Signer,
  recipient: string,
  recipientName: string,
  course: string,
  institution: string
): Promise<ethers.ContractTransactionResponse> {
  const contract = getWriteContractInstance(signer);
  const tx = await contract.issueCertificate(
    recipient,
    recipientName,
    course,
    institution
  );
  return tx;
}

/**
 * Revoke a certificate on-chain (Owner only)
 */
export async function revokeCertificateOnChain(
  signer: ethers.Signer,
  certificateId: string | number | bigint
): Promise<ethers.ContractTransactionResponse> {
  const contract = getWriteContractInstance(signer);
  const idBigInt = BigInt(certificateId);
  const tx = await contract.revokeCertificate(idBigInt);
  return tx;
}

/**
 * Authorize an issuer address (Owner only)
 */
export async function authorizeIssuerOnChain(
  signer: ethers.Signer,
  issuerAddress: string
): Promise<ethers.ContractTransactionResponse> {
  const contract = getWriteContractInstance(signer);
  const tx = await contract.authorizeIssuer(issuerAddress);
  return tx;
}

/**
 * Remove an issuer address (Owner only)
 */
export async function removeIssuerOnChain(
  signer: ethers.Signer,
  issuerAddress: string
): Promise<ethers.ContractTransactionResponse> {
  const contract = getWriteContractInstance(signer);
  const tx = await contract.removeIssuer(issuerAddress);
  return tx;
}
