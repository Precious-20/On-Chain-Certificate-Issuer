export interface ParsedWeb3Error {
  friendlyMessage: string;
  code?: string;
  isUserRejected: boolean;
  isNotFound: boolean;
  isRevoked: boolean;
  isUnauthorized: boolean;
  rawError?: any;
}

export function parseWeb3Error(error: any): ParsedWeb3Error {
  if (!error) {
    return {
      friendlyMessage: "An unknown error occurred.",
      isUserRejected: false,
      isNotFound: false,
      isRevoked: false,
      isUnauthorized: false,
    };
  }

  const errString = String(error.message || error.reason || error).toLowerCase();

  // 1. User rejection
  if (
    error.code === 4001 ||
    error.code === "ACTION_REJECTED" ||
    errString.includes("user rejected") ||
    errString.includes("user denied") ||
    errString.includes("rejected the request")
  ) {
    return {
      friendlyMessage: "Transaction was cancelled in your wallet.",
      code: "ACTION_REJECTED",
      isUserRejected: true,
      isNotFound: false,
      isRevoked: false,
      isUnauthorized: false,
      rawError: error,
    };
  }

  // 2. Custom Solidity Errors
  if (
    errString.includes("certificatedoesnotexist") ||
    errString.includes("certificate does not exist")
  ) {
    return {
      friendlyMessage: "Certificate Not Found: The provided Certificate ID does not exist on-chain.",
      code: "CertificateDoesNotExist",
      isUserRejected: false,
      isNotFound: true,
      isRevoked: false,
      isUnauthorized: false,
      rawError: error,
    };
  }

  if (
    errString.includes("certificatealreadyrevoked") ||
    errString.includes("certificate already revoked")
  ) {
    return {
      friendlyMessage: "Certificate Revoked: This certificate has already been revoked.",
      code: "CertificateAlreadyRevoked",
      isUserRejected: false,
      isNotFound: false,
      isRevoked: true,
      isUnauthorized: false,
      rawError: error,
    };
  }

  if (
    errString.includes("notauthorized") ||
    errString.includes("not authorized")
  ) {
    return {
      friendlyMessage: "Unauthorized Action: Your wallet does not have permission for this operation.",
      code: "NotAuthorized",
      isUserRejected: false,
      isNotFound: false,
      isRevoked: false,
      isUnauthorized: true,
      rawError: error,
    };
  }

  // 3. Contract not configured error
  if (errString.includes("contract address is not configured")) {
    return {
      friendlyMessage: "Contract Not Configured: Deployed contract address has not been provided by Team A.",
      code: "UNCONFIGURED_CONTRACT",
      isUserRejected: false,
      isNotFound: false,
      isRevoked: false,
      isUnauthorized: false,
      rawError: error,
    };
  }

  // 4. Insufficient funds / gas
  if (errString.includes("insufficient funds") || error.code === "INSUFFICIENT_FUNDS") {
    return {
      friendlyMessage: "Insufficient funds in your connected wallet for transaction gas fees.",
      code: "INSUFFICIENT_FUNDS",
      isUserRejected: false,
      isNotFound: false,
      isRevoked: false,
      isUnauthorized: false,
      rawError: error,
    };
  }

  // Fallback to error reason or cleaned message
  const fallbackMessage = error.reason || error.shortMessage || error.message || "Operation failed on-chain.";
  
  return {
    friendlyMessage: fallbackMessage,
    code: error.code ? String(error.code) : "UNKNOWN",
    isUserRejected: false,
    isNotFound: false,
    isRevoked: false,
    isUnauthorized: false,
    rawError: error,
  };
}
