# TechCrush Web3 Blockchain Capstone: On-Chain Certificate Issuer

> **Team C — Web3 Integration & Sepolia End-to-End Verification Report**

An immutable, decentralized educational credential verification and certificate issuance platform powered by an EVM Solidity smart contract (`src/CertificateIssuer.sol`) deployed live on Ethereum Sepolia Testnet and a modern Web3 React application (`frontend/`).

---

## 🌐 Deployed Sepolia Contract Information

| Parameter                    | Value                                                                                                                                                                      |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Network**                  | Ethereum Sepolia Testnet                                                                                                                                                   |
| **Chain ID**                 | `11155111`                                                                                                                                                                 |
| **Contract**                 | `CertificateIssuer`                                                                                                                                                        |
| **Contract Address**         | [`0x74B78BD8F0EF1931F8cD869c2d55055b1906b03C`](https://sepolia.etherscan.io/address/0x74B78BD8F0EF1931F8cD869c2d55055b1906b03C)                                            |
| **Deployment Transaction**   | [`0x73f5b0ebb736062abb726a979e837004fbe02d55b29c920d6246b5bb3293a22b`](https://sepolia.etherscan.io/tx/0x73f5b0ebb736062abb726a979e837004fbe02d55b29c920d6246b5bb3293a22b) |
| **Block Explorer**           | [https://sepolia.etherscan.io](https://sepolia.etherscan.io)                                                                                                               |
| **Confirmed Contract Owner** | `0xCACC3cCb64921D075a138F2B5E595B59fEa7C853`                                                                                                                               |

---

## 📊 Team C — On-Chain Integration Verification Report

|   #    | Test Case                                                  |  Status  | Details / On-Chain Verification                                                                                                                                                                                 |
| :----: | :--------------------------------------------------------- | :------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | **Wallet Connection & Network Detection**                  | **PASS** | Detects EIP-1193 injected wallet (MetaMask), extracts connected address, tracks `accountsChanged` / `chainChanged`, requires Chain ID `11155111` (Sepolia), and warns if connected to another network.          |
| **2**  | **Read Contract Owner (`owner()`)**                        | **PASS** | Successfully queries live contract at `0x74B78BD8F0EF1931F8cD869c2d55055b1906b03C` on Sepolia and resolves owner address `0xCACC3cCb64921D075a138F2B5E595B59fEa7C853`.                                          |
| **3**  | **Issuer Authorization Query (`authorizedIssuers()`)**     | **PASS** | Queries public mapping view `authorizedIssuers(address)` and updates `isIssuer` / `isOwner` permissions state.                                                                                                  |
| **4**  | **Verify Certificate (`verifyCertificate()`)**             | **PASS** | Queries 7-field struct tuple (`id`, `recipient`, `recipientName`, `course`, `institution`, `issueDate`, `revoked`). Supports fallback RPC read provider when wallet is disconnected.                            |
| **5**  | **Certificate Validity (`isCertificateValid()`)**          | **PASS** | Evaluates on-chain boolean (`true` for valid, `false` for revoked).                                                                                                                                             |
| **6**  | **Issue Certificate (`issueCertificate()`)**               | **PASS** | Sends transaction to `0x74B78BD8F0EF1931F8cD869c2d55055b1906b03C`, waits for Sepolia block confirmation, parses `CertificateIssued` event log from transaction receipt, and displays extracted `certificateId`. |
| **7**  | **Certificate Revocation (`revokeCertificate()`)**         | **PASS** | Restricted to contract owner wallet; emits `CertificateRevoked` on-chain and updates certificate validity state.                                                                                                |
| **8**  | **Issuer Governance (`authorizeIssuer` / `removeIssuer`)** | **PASS** | Contract owner can grant/revoke issuing authority; removed or unauthorized issuers reverting on-chain are caught with custom `NotAuthorized()` error handling.                                                  |
| **9**  | **Custom EVM Error Parsing**                               | **PASS** | Correctly decodes `CertificateDoesNotExist()` (`0x2779833b`), `CertificateAlreadyRevoked()`, `NotAuthorized()`, user cancellations (`4001` / `ACTION_REJECTED`), and insufficient gas errors.                   |
| **10** | **Etherscan Links**                                        | **PASS** | Dynamically constructs transaction links pointing to `https://sepolia.etherscan.io/tx/<actual-tx-hash>`.                                                                                                        |

---

## 🏗️ Architecture & Component Layout

```
frontend/
├── src/
│   ├── config/
│   │   ├── contractConfig.ts     # Deployed contract address configuration
│   │   └── networkConfig.ts      # Sepolia Chain ID (11155111) and Explorer settings
│   ├── contracts/
│   │   ├── CertificateIssuerABI.ts # Extracted Solidity ABI matching Sepolia deployment
│   │   └── types.ts              # TypeScript interfaces for Certificate, Wallet, and TxState
│   ├── web3/
│   │   ├── provider.ts           # EIP-1193 browser provider wrapper & fallback RPC reader
│   │   ├── reads.ts              # Contract read functions (verifyCertificate, owner, etc.)
│   │   ├── writes.ts             # Contract write transactions (issue, revoke, authorize)
│   │   ├── errors.ts             # Custom EVM error parser (NotAuthorized, CertificateDoesNotExist, etc.)
│   │   └── walletContext.tsx     # React context & hook for wallet state and Sepolia network checks
│   ├── components/
│   │   ├── Navbar.tsx            # Header navigation & network status bar
│   │   ├── WalletButton.tsx      # Connect / disconnect button & network popover
│   │   ├── StatusBadge.tsx       # Status indicator badges
│   │   ├── CertificateResultCard.tsx # Detailed verified certificate view with Etherscan links
│   │   ├── TransactionStatus.tsx # Modal for transaction lifecycle & Etherscan hash links
│   │   ├── ConfirmationModal.tsx # Confirmation dialog for admin actions
│   │   ├── ErrorMessage.tsx      # Error notification banner
│   │   └── LoadingState.tsx      # Animated loading spinner
│   └── pages/
│       ├── HomePage.tsx          # Landing page with workflow breakdown
│       ├── VerifyPage.tsx        # Public certificate search & verification console
│       ├── IssuePage.tsx         # Certificate minting console (Event log parsing for CertificateID)
│       └── AdminPage.tsx         # Admin dashboard for revocation, issuer governance, and contract info
```

---

## 🧪 Build & Test Verification Results

- **Frontend Production Build (`npm run build`)**: **PASS** (Compiled 2,054 modules in 3.49s with 0 errors)
- **Foundry Smart Contract Test Suite (`forge test`)**: **PASS** (18/18 tests passed, 0 failed, 0 skipped)
- **Smart Contract Safety**: `src/CertificateIssuer.sol` preserved **strictly unmodified** (0 changes).
- **Security & Git Audit**: Zero private keys or credentials staged. `.env.local` is ignored by `.gitignore`.

---

## ⚙️ Running Locally

1. **Environment Configuration**: Create a `.env.local` file inside `frontend/`:

   ```env
   VITE_CONTRACT_ADDRESS=0x74B78BD8F0EF1931F8cD869c2d55055b1906b03C
   VITE_TARGET_CHAIN_ID=11155111
   VITE_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<YOUR_ALCHEMY_KEY>
   VITE_BLOCK_EXPLORER_URL=https://sepolia.etherscan.io
   ```

2. **Run Application**:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

3. **Run Foundry Tests**:
   ```powershell
   forge test
   ```
