import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  StyleSheet,
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
    const entropy = crypto.getRandomValues(new Uint8Array(16));
    const mnemonic = bip39.entropyToMnemonic(entropy, wordlist);

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(Buffer.from(seed), bitcoin.networks.bitcoin);
    const child1 = root.derivePath(BTC_DERIVATION_PATH);

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
      <Text style={{ fontSize: 30 }}>Crypto Testing</Text>

      <TouchableOpacity
        onPress={onClickmePressed}
        style={{
          backgroundColor: "#1E1E1E",
          borderRadius: 20,
          width: "50%",
          height: 30,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white" }}>Click me</Text>
      </TouchableOpacity>

      <Text>{wallet.address}</Text>
      <Text>{wallet.key}</Text>
    </View>
  );
}

const $root: ViewStyle = {
  flex: 1,
  backgroundColor: "#fff",
  padding: 12,
  marginTop: 60,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 100,
    padding: 12,
  },
});
