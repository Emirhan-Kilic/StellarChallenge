# StellarLink – Web3 Reputation Passport (MVP)

## 🎯 Overview

StellarLink is a **Web3 reputation system** on Stellar, providing each user a **Soulbound NFT (Reputation Passport)** based on their wallet history and verified actions.  
This MVP demonstrates a **working frontend, contract integration, and testnet deployment**, showing scores and badges for Finance, Social, and Knowledge categories.

---

## 🚀 Project Description

- Users connect their Stellar wallet via **Freighter**.
- A **simple Soroban smart contract** maintains reputation data and handles minting of a Soulbound NFT.
- Frontend displays:
  - Reputation scores
  - Minted NFT badge
  - Update reputation functionality

**Goal:** Fully functional, visually modern MVP for hackathon/demo purposes.

---

## 📋 Problem Statement

Blockchain lacks a portable, on-chain trust and reputation system.  
StellarLink fills this gap by providing a **simple, transparent, cross-domain reputation system** with a Soulbound NFT, fully functional on **Stellar Testnet**.

---

## ✅ Features / To-Do

### Frontend
- React + Tailwind dashboard
- “Connect Wallet”, “View Score”, “Update Score”, “Mint NFT” buttons
- Display NFT badge and reputation scores
- Single-page layout (`/dashboard`)

### Smart Contract (Rust + Soroban)
- 3–4 functions:
  1. `init_passport(address)` → register new user
  2. `update_score(address, finance, social, knowledge)` → update scores
  3. `get_score(address)` → read scores
  4. `mint_soulbound(address)` → **Option A: simulated NFT minting**
- Minimal ledger storage (`Map<Address, ReputationData>`)
- Optional hardening: prevent token transfer if real NFT is used

### Wallet Integration
- **Freighter Wallet API**
- Connect / Disconnect
- Use wallet address in contract calls

---

## ❌ Out of Scope

**Contract:**
- Complex reputation logic
- Multi-token support
- Admin access control
- Multi-signature
- Off-chain AI scoring
- Time-lock / fee calculations

**Frontend:**
- Advanced state management (Redux, etc.)

---

## 🛠 Tech Stack

| Layer        | Technology           | Purpose                         |
|--------------|-------------------|---------------------------------|
| Frontend     | Next.js + Tailwind + TypeScript | Dashboard + UI                 |
| Contract     | Rust + Soroban SDK | Reputation logic & NFT management |
| Wallet       | Freighter API      | Wallet connection & signing     |
| Backend (optional) | Flask API      | JSON export for 3rd-party dApps |
| Network      | Stellar Testnet    | Development & demo             |

---

## 🧪 Test Cases

| Test                                      | Expected Result                           |
|-------------------------------------------|-------------------------------------------|
| Contract deploy                             | Successful deployment on Testnet         |
| Wallet connection                           | Connect/disconnect works                  |
| `init_passport()`                           | User successfully registered              |
| `update_score()`                            | Scores updated correctly                  |
| `get_score()`                               | Scores returned correctly in UI           |
| `mint_soulbound()`                          | Option A: boolean mint flag updated       |
| Optional hardening                           | NFT transfer prevented (if real token)    |

---

## 📱 Development Workflow

### Step 1: Setup
- Install Soroban CLI + Freighter SDK
- Start Next.js + Tailwind project

### Step 2: Contract Development
- 3–4 function reputation contract
- `mint_soulbound` → Option A simulated mint
- Optional hardening → transfer prevention
- Deploy on Testnet
- Test with `invoke` commands

### Step 3: Frontend Integration
- Connect Freighter wallet
- Call `get_score`, `update_score`, `mint_soulbound`
- Update UI with real-time or refresh

---

## 🎯 Success Criteria

- ✅ Contract works on Testnet
- ✅ Frontend properly integrated
- ✅ Wallet connection functional
- ✅ User can view/update reputation scores
- ✅ Soulbound NFT mint works (Option A)
- ✅ Optional hardening applied for non-transferable NFT
- ✅ Fully functional, modern, demo-ready MVP

---

## 💡 Notes
- MVP focuses on **functionality first**; real token minting is optional and can be implemented later.
- Frontend is intentionally simple to prioritize a working prototype.
