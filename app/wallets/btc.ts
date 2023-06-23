import BIP32Factory, { BIP32Interface } from "bip32";
import { wordlist } from "@scure/bip39/wordlists/english";

import * as ecc from "@bitcoinerlab/secp256k1";
import * as bip39 from "@scure/bip39";
import * as bitcoin from "bitcoinjs-lib";

const bip32 = BIP32Factory(ecc);

const BTC_DERIVATION_PATH = "m/84'/0'/0'/0";

class BTCWallet {
  addresses: string[] = [];
  index: number = 0;
  privateKey: string;

  constructor() {}

  generate() {
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
    const root = bip32.fromSeed(Buffer.from(seed), bitcoin.networks.bitcoin);
    end = performance.now();
    console.log(`[Seed Derivation] ${end - start}ms`);

    start = performance.now();
    const child1 = root.derivePath(`${BTC_DERIVATION_PATH}/${this.index}`);
    end = performance.now();
    console.log(`[Path Derivation] ${end - start}ms\n\n=====\n\n`);
  }

  getDerivationPath() {
    return `${BTC_DERIVATION_PATH}/${this.index}`;
  }
}

export const bWallet = new BTCWallet();
