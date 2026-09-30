export interface RawCertificate {
  id: bigint;
  recipient: string;
  recipientName: string;
  course: string;
  institution: string;
  issueDate: bigint;
  revoked: boolean;
}

export interface FormattedCertificate {
  id: string;
  recipient: string;
  recipientName: string;
  course: string;
  institution: string;
  issueDateFormatted: string;
  issueTimestamp: number;
  revoked: boolean;
  isValid: boolean;
}

export type TxStatusType =
  | 'idle'
  | 'wallet-connecting'
  | 'confirming'
  | 'pending'
  | 'success'
  | 'error';

export interface TxState {
  status: TxStatusType;
  txHash?: string;
  message?: string;
  errorMessage?: string;
  isUserRejected?: boolean;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  chainName: string | null;
  isSupportedNetwork: boolean;
  ownerAddress: string | null;
  isOwner: boolean;
  isIssuer: boolean;
  error: string | null;
}
