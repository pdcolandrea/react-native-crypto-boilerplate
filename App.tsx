import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  LayoutAnimation,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import BIP32Factory from "bip32";
import { wordlist } from "@scure/bip39/wordlists/english";

import * as ecc from "@bitcoinerlab/secp256k1";
import * as bip39 from "@scure/bip39";
import * as bitcoin from "bitcoinjs-lib";

const bip32 = BIP32Factory(ecc);

interface WalletState {
  address: string;
  key: string;
}

const BTC_DERIVATION_PATH = "m/84'/0'/0'/0/0";

export default function App() {
  const [wallet, setWallet] = useState<WalletState>({
    address: "",
    key: "",
  });

  const onClickmePressed = () => {
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
    const child1 = root.derivePath(BTC_DERIVATION_PATH);
    end = performance.now();
    console.log(`[Path Derivation] ${end - start}ms\n\n=====\n\n`);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setWallet({
      address: bitcoin.payments.p2wpkh({
        pubkey: child1.publicKey,
      }).address,
      key: mnemonic,
    });
  };

  return (
    <View style={$root}>
      <StatusBar style="auto" />
      <Text style={{ fontSize: 30 }}>CRYPTO testing</Text>

      <Text>{wallet.address}</Text>
      <Text>{wallet.key}</Text>

      <TouchableOpacity onPress={onClickmePressed} style={$button}>
        <Text style={{ color: "white", fontSize: 17, fontWeight: "600" }}>
          Generate Wallet
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const $root: ViewStyle = {
  flex: 1,
  backgroundColor: "#fff",
  padding: 12,
  marginTop: 60,
};

const $button: ViewStyle = {
  backgroundColor: "#1E1E1E",
  borderRadius: 20,
  width: "90%",
  height: 50,
  alignSelf: "center",
  position: "absolute",
  bottom: 50,
  justifyContent: "center",
  alignItems: "center",

  shadowColor: "red",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.5,
  shadowRadius: 12.35,

  elevation: 19,
};
