import { useState } from "react";
import BIP32Factory, { BIP32Interface } from "bip32";
import { wordlist } from "@scure/bip39/wordlists/english";

import * as ecc from "@bitcoinerlab/secp256k1";
import * as bip39 from "@scure/bip39";
import * as bitcoin from "bitcoinjs-lib";
import {
  BTC_DERIVATION_PATH,
  LTC_DERIVATION_PATH,
  Networks,
} from "../constants/cryptos";
import { LayoutAnimation } from "react-native";

const bip32 = BIP32Factory(ecc);

interface WalletState {
  addresses: string[];
  root: BIP32Interface | null;
  key: string;
  adrIndex: number;
}

export const useTimedWallet = (network: keyof typeof Networks) => {
  const [wallet, setWallet] = useState<WalletState>({
    addresses: [],
    root: null,
    key: "",
    adrIndex: 0,
  });

  const derivationPath =
    network === "bitcoin" ? BTC_DERIVATION_PATH : LTC_DERIVATION_PATH;
  const networkConfig = Networks[network];

  const generateWallet = (showTiming = true) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    let start = performance.now();
    const entropy = crypto.getRandomValues(new Uint8Array(16));
    let end = performance.now();
    console.log(`[Entropy Generation] ${end - start}ms`);

    start = performance.now();
    const mnemonic = bip39.entropyToMnemonic(entropy, wordlist);
    end = performance.now();
    console.log(`[Mnemonic Generation] ${end - start}ms`);

    // SLOW
    start = performance.now();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    end = performance.now();
    console.log(`[Seed Sync] ${end - start}ms`);
    // ==

    start = performance.now();
    const root = bip32.fromSeed(Buffer.from(seed), networkConfig);
    end = performance.now();
    console.log(`[Seed Derivation] ${end - start}ms`);

    start = performance.now();
    const child1 = root.derivePath(`${derivationPath}/${wallet.adrIndex}`);
    end = performance.now();
    console.log(`[Path Derivation] ${end - start}ms\n\n=====\n\n`);

    setWallet({
      addresses: [
        bitcoin.payments.p2wpkh({
          pubkey: child1.publicKey,
          network: networkConfig,
        }).address,
      ],
      key: mnemonic,
      adrIndex: 0,
      root,
    });
  };

  return { wallet };
};
