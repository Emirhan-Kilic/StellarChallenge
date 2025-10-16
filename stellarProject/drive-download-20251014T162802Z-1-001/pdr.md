# StellarSkip – A Real-Time Market for Queues (MVP)

> StellarSkip is a decentralized marketplace for physical queue spots on Stellar, providing each user a tradable NFT (Queue Token) representing their position in line. This MVP demonstrates a working frontend, contract integration, and testnet deployment, showing a live market for a simulated queue that can be joined, traded, and verified.

---

## 🚀 Project Description

-   Users connect their Stellar wallet via **Freighter**.
-   A **simple Soroban smart contract** manages a specific queue, handling the minting and atomic swapping of Queue Tokens (NFTs).
-   The frontend displays:
    -   A live, ordered list of the queue.
    -   The user's current position and NFT.
    -   Options to buy a better spot or sell their current one.

**Goal:** A fully functional, visually modern MVP for a hackathon demo that proves the core "Mint -> Trade -> Verify" loop.

---

## 📋 Problem Statement

Waiting in physical queues is inefficient and frustrating, creating a loss of value for both those who wait and those who need to save time. StellarSkip solves this by creating a **fair, transparent, and efficient marketplace for time**, using tradable NFTs on the **Stellar Testnet**.

---

## ✅ Features / To-Do

### Frontend

-   React + Tailwind dashboard.
-   “Connect Wallet”, “**Join Queue**”, “**List for Sale**”, and “**Buy Token**” buttons.
-   Display the live queue list, showing token numbers, owners, and sale prices.
-   A "My Token" view showing the user's QR code for physical verification.
-   Single-page layout.

### Smart Contract (Rust + Soroban)

-   4-5 core functions:
    1.  `init_queue(admin)` → Creates a new queue contract.
    2.  `join_queue()` → Mints the next sequential NFT to the caller.
    3.  `list_for_sale(token_id, price)` → Puts a user's token up for sale.
    4.  `buy_token(token_id)` → **Performs an atomic swap** of XLM for the NFT.
    5.  `owner_of(token_id)` → View function to check the current owner for verification.
-   Minimal ledger storage (`Map<u32, Address>` for owners, `Map<u32, u128>` for prices).

### Wallet & Verification

-   **Freighter Wallet API** for connection and signing transactions.
-   A simple QR code scanner component/page in the app for the "Barista" to verify token ownership by calling `owner_of`.

---

## ❌ Out of Scope

**Contract:**

-   Venue fees or profit-sharing.
-   Dynamic pricing, auctions, or bidding systems.
-   Admin controls (pausing the queue, etc.).
-   Geo-fencing or other real-world constraints.

**Frontend:**

-   Support for multiple, simultaneous queues.
-   Notifications.

---

## 🛠 Tech Stack

| Layer      | Technology                  | Purpose                                        |
| ---------- | --------------------------- | ---------------------------------------------- |
| Frontend   | Next.js + Tailwind + TypeScript | Dashboard, live queue UI, & Verifier scanner   |
| Contract   | Rust + Soroban SDK          | Queue logic & atomic swap market               |
| Wallet     | Freighter API               | Wallet connection & signing                  |
| Network    | Stellar Testnet             | Development & demo                             |

---

## 🧪 Test Cases

| Test                 | Expected Result                                       |
| -------------------- | --------------------------------------------------------- |
| Contract deploy      | Successful deployment of the queue contract on Testnet    |
| Wallet connection    | Connect/disconnect works smoothly                       |
| `join_queue()`       | User receives the next sequential NFT in their wallet     |
| `list_for_sale()`    | Token is correctly marked for sale at the specified price |
| `buy_token()`        | **NFT and XLM are swapped correctly between users** |
| `owner_of()`         | Returns the correct new owner's address after a sale    |
| QR Code Verification | Scanner reads QR and successfully verifies ownership      |

---

## 📱 Development Workflow

1.  **Setup**
    -   Install Soroban CLI + Freighter SDK.
    -   Initialize a Next.js + Tailwind project.

2.  **Contract Development**
    -   Implement the 5 core functions (`init`, `join`, `list`, `buy`, `owner_of`).
    -   Focus heavily on perfecting the `buy_token` atomic swap logic.
    -   Deploy on Testnet and test all functions with `soroban contract invoke` commands.

3.  **Frontend Integration**
    -   Build the UI to connect to Freighter.
    -   Create components to display the live queue by fetching data from the contract.
    -   Wire up the "Join", "List", and "Buy" buttons to their respective contract functions.
    -   Build the "My Token" view with the QR code generator.
    -   Build the simple "Verifier" page with a QR scanner that calls `owner_of`.

---

## 🎯 Success Criteria

-   [ ] Contract works as expected on Testnet.
-   [ ] Frontend is fully integrated, displaying live data.
-   [ ] Wallet connection and transaction signing are functional.
-   [ ] A user can successfully join a queue and receive an NFT.
-   [ ] A user can list their NFT for sale and another user can successfully buy it.
-   [ ] **On-site verification via the QR code scanner is functional.**
-   [ ] A fully functional, modern, and compelling demo-ready MVP.

---

### 💡 Notes

> The MVP's success hinges on flawlessly demonstrating the core loop: **Mint -> Trade -> Verify**. Real-world features like geo-fencing are intentionally excluded to prioritize a working, impressive prototype for the hackathon.