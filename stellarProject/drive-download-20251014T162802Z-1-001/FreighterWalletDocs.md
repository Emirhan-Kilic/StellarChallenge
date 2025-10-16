# 🪐 Freighter Wallet Integration (v5.0.0+)

> Official package: [`@stellar/freighter-api`](https://www.npmjs.com/package/@stellar/freighter-api)  
> Docs: [docs.freighter.app](https://docs.freighter.app/docs/guide/usingfreighterwebapp)

---

## ⚙️ Installation

```bash
npm install @stellar/freighter-api

```

Import the whole library or only what you need:

// Entire library
import freighterApi from "@stellar/freighter-api";

// Modular imports
import {
  isConnected,
  isAllowed,
  setAllowed,
  requestAccess,
  getAddress,
  getNetwork,
  getNetworkDetails,
  signTransaction,
  signMessage,
  signAuthEntry,
  signBlob,
  addToken,
  watchWalletChanges,
} from "@stellar/freighter-api";

```

---

## 🔍 **Connection and Permissions**

### `isConnected()`

Check if Freighter is installed:

```js
const { isConnected } = await isConnected();
if (isConnected) console.log("✅ Freighter detected");
else console.error("❌ Freighter not found");

```

### `isAllowed()`

Check if the user authorized your app:

```js
const { isAllowed } = await isAllowed();
if (isAllowed) console.log("✅ App authorized");

```

### `setAllowed()`

Prompt user to allow your app:

```js
const { isAllowed } = await setAllowed();
if (isAllowed) console.log("✅ App added to allowed list");
else console.warn("❌ User denied access");

```

### `requestAccess()`

Prompt and get user's public key:

```js
const { address, error } = await requestAccess();
if (error) console.error("Access denied:", error);
else console.log("User public key:", address);

```

---

## 📬 **Get Account Info**

### `getAddress()`

Get public key silently (only if previously allowed):

```js
const { address, error } = await getAddress();
if (error) console.error("getAddress failed:", error);
else console.log("Public key:", address);
```

---

## 🌐 **Network Info**

### `getNetwork()`

```js
const { network, networkPassphrase } = await getNetwork();
console.log("Network:", network, networkPassphrase);
```

### `getNetworkDetails()`

```js
const details = await getNetworkDetails();
console.log("Network URL:", details.networkUrl);
console.log("Soroban RPC URL:", details.sorobanRpcUrl);

```

---

## ✍️ **Signing**

### `signTransaction(xdr, opts)`

Sign a transaction XDR:

```js
const { signedTxXdr, signerAddress, error } = await signTransaction(xdr, {
  network: "TESTNET", // or "PUBLIC"
  address: userAddress,
});
if (error) console.error("Signing failed:", error);
else console.log("Signed TX XDR:", signedTxXdr);

```

### `signAuthEntry(authEntryXdr, opts)`

```js
const { signedAuthEntry, error } = await signAuthEntry(authEntryXdr, {
  address: userAddress,
});
if (error) console.error(error);
else console.log("Signed auth entry:", signedAuthEntry);

```

### `signMessage(message, opts)`

```js
const { signedMessage, signerAddress, error } = await signMessage(
  "Hello World",
  { address: userAddress }
);
if (error) console.error(error);
else console.log("Signed message (base64):", signedMessage);

### 'signBlob(blob, opts)'

Sign arbitrary binary data (for advanced use).

const { signedBlob, error } = await signBlob(blobXdr, { address: userAddress });

```

---

## 🚀 **Submitting Signed Transaction to Horizon**

```js
import { Server, TransactionBuilder } from "stellar-sdk";

const server = new Server("https://horizon-testnet.stellar.org");

const tx = TransactionBuilder.fromXDR(signedXdr, StellarSdk.Networks.TESTNET);

server.submitTransaction(tx)
  .then(response => console.log("Transaction successful:", response))
  .catch(error => console.error("Submission failed:", error));


---


### 'watchWalletChanges(callback)'

Detect when user switches network or account.

watchWalletChanges(({ address, network }) => {
  console.log("User switched:", address, network);
});


```

## ✅ Suggested Flow for Your Web App

1. Check if Freighter is connected (`isConnected`)
2. Ask for access (`requestAccess`)
3. Get public key (`getAddress`)
4. Show network (`getNetworkDetails`)
5. Prepare transaction (using Stellar SDK)
6. Sign with `signTransaction`
7. Submit to Horizon

---