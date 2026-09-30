import { ethers } from "ethers";
import { CONTRACT_ADDRESS, isContractConfigured } from "../config/contractConfig";
import { CERTIFICATE_ISSUER_ABI } from "../contracts/CertificateIssuerABI";
import type { FormattedCertificate, RawCertificate } from "../contracts/types";

function getContractInstance(runner: ethers.ContractRunner): ethers.Contract {
  if (!isContractConfigured()) {
    throw new Error(
      "Contract Not Configured: The smart contract has not been deployed yet. Team A will supply the contract address once deployed."
    );
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CERTIFICATE_ISSUER_ABI, runner);
}

/**
 * Fetch certificate by ID on-chain
 */
export async function fetchCertificateOnChain(
  runner: ethers.ContractRunner,
  certificateId: string | number | bigint
): Promise<FormattedCertificate> {
  const contract = getContractInstance(runner);
  
  const idBigInt = BigInt(certificateId);
  const rawCert: RawCertificate = await contract.verifyCertificate(idBigInt);

  const issueTimestamp = Number(rawCert.issueDate);
  const issueDateFormatted = new Date(issueTimestamp * 1000).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return {
    id: rawCert.id.toString(),
    recipient: rawCert.recipient,
    recipientName: rawCert.recipientName,
    course: rawCert.course,
    institution: rawCert.institution,
    issueDateFormatted,
    issueTimestamp,
    revoked: rawCert.revoked,
    isValid: !rawCert.revoked,
  };
}

/**
 * Check certificate validity on-chain
 */
export async function checkCertificateValidityOnChain(
  runner: ethers.ContractRunner,
  certificateId: string | number | bigint
): Promise<boolean> {
  const contract = getContractInstance(runner);
  const idBigInt = BigInt(certificateId);
  return await contract.isCertificateValid(idBigInt);
}

/**
 * Check if address is contract owner
 */
export async function fetchContractOwnerOnChain(
  runner: ethers.ContractRunner
): Promise<string> {
  const contract = getContractInstance(runner);
  return await contract.owner();
}

/**
 * Check if address is an authorized issuer
 */
export async function checkIsAuthorizedIssuerOnChain(
  runner: ethers.ContractRunner,
  issuerAddress: string
): Promise<boolean> {
  const contract = getContractInstance(runner);
  return await contract.authorizedIssuers(issuerAddress);
}
