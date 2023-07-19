import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  LayoutAnimation,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Icon } from "react-native-elements";
import BIP32Factory, { BIP32Interface } from "bip32";
import { wordlist } from "@scure/bip39/wordlists/english";

import * as ecc from "@bitcoinerlab/secp256k1";
import * as bip39 from "@scure/bip39";
import * as bitcoin from "bitcoinjs-lib";

const bip32 = BIP32Factory(ecc);

interface WalletState {
  addresses: string[];
  root: BIP32Interface | null;
  key: string;
  adrIndex: number;
}

const BTC_DERIVATION_PATH = "m/84'/0'/0'/0";

export default function App() {
  const [wallet, setWallet] = useState<WalletState>({
    addresses: [],
    root: null,
    key: "",
    adrIndex: 0,
  });

  const onGenerateWalletPressed = () => {
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
    const root = bip32.fromSeed(Buffer.from(seed), bitcoin.networks.bitcoin);
    end = performance.now();
    console.log(`[Seed Derivation] ${end - start}ms`);

    start = performance.now();
    const child1 = root.derivePath(`${BTC_DERIVATION_PATH}/${wallet.adrIndex}`);
    end = performance.now();
    console.log(`[Path Derivation] ${end - start}ms\n\n=====\n\n`);

    setWallet({
      addresses: [
        bitcoin.payments.p2wpkh({
          pubkey: child1.publicKey,
        }).address,
      ],
      key: mnemonic,
      adrIndex: 0,
      root,
    });
  };

  // TODO: KEEP TRACK OF ADDRESSES
  const onGenerateAddressPressed = () => {
    if (wallet.adrIndex >= 7) return;

    const index = wallet.adrIndex + 1;
    const newChild = wallet.root.derivePath(`${BTC_DERIVATION_PATH}/${index}`);

    const newAddress = bitcoin.payments.p2wpkh({
      pubkey: newChild.publicKey,
    }).address;

    setWallet((prev) => {
      return {
        ...prev,
        adrIndex: index,
        addresses: [...prev.addresses, newAddress],
      };
    });
  };

  return (
    <View style={$root}>
      <StatusBar style="dark" />
      <View
        style={{
          alignSelf: "flex-start",
        }}
      >
        <Text style={{ fontSize: 40, color: "white", fontWeight: "800" }}>
          C R Y P T O
        </Text>
        <Text style={$subheader}>expo boilerplate</Text>
      </View>

      <View
        style={{
          height: "22%",
          backgroundColor: "#323536",
          marginTop: 24,
          marginBottom: 12,
          borderRadius: 24,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.29,
          shadowRadius: 4.65,

          elevation: 7,
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            paddingHorizontal: 12,
            flexDirection: "row",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: "white", fontSize: 18 }}>Balance</Text>
            <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
              <Text style={{ fontSize: 40, fontWeight: "700", color: "white" }}>
                0
              </Text>
              <Text style={{ fontSize: 30, marginBottom: 3, color: "white" }}>
                sat
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            height: "35%",
            backgroundColor: "#2b2e2f",
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Icon name="check" type="feather" color="white" />
          <Icon name="globe" type="feather" color="white" />
          <Icon
            name="refresh-ccw"
            type="feather"
            color="white"
            onPress={onGenerateWalletPressed}
          />
          <Icon name="more-horizontal" type="feather" color="white" />
        </View>
      </View>

      <View
        style={{
          backgroundColor: "#323536",
          padding: 12,
          borderRadius: 24,
          height: 150,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={[$bodyText, { fontWeight: "700" }]}>Private Key</Text>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Icon name="copy" type="feather" color="#828284" size={10} />
            <Text style={{ color: "#828284", marginLeft: 3 }}>Copy</Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexGrow: 1,
            alignContent: "flex-end",
            flexDirection: "row",
            flexWrap: "wrap",
            marginLeft: -4,
          }}
        >
          {wallet.key.split(" ").map((word, index) => {
            return (
              <View
                key={`${word}-${index}`}
                style={{
                  marginHorizontal: 3,
                  marginVertical: 3,
                  borderColor: "#ef6d4e",
                  borderWidth: 1.5,
                  borderRadius: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontSize: 14 }}>{word}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View
        style={{
          backgroundColor: "#323536",
          marginTop: 12,
          padding: 12,
          borderRadius: 24,
          height: 80,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={[$bodyText, { fontWeight: "700" }]}>Address</Text>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Icon name="copy" type="feather" color="#828284" size={10} />
            <Text style={{ color: "#828284", marginLeft: 3 }}>Copy</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 5,
          }}
        >
          <AddressText address={wallet.addresses[0]} />
        </View>
      </View>
    </View>
  );
}

const AddressText = ({ address }: { address: string }) => {
  let text = "";
  if (address && address.startsWith("bc1")) {
    text = address.slice(3);
  }
  return (
    <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>
      <Text style={{ fontWeight: "800", color: "#ef6d4e" }}>bc1</Text>
      {text}
    </Text>
  );
};

const $root: ViewStyle = {
  flex: 1,
  backgroundColor: "#181818",
  padding: 12,
  paddingTop: 60,
};

const $bodyText: TextStyle = {
  color: "white",
  fontSize: 18,
};

const $row: ViewStyle = {
  flexDirection: "row",
};

const $subheader: TextStyle = {
  color: "#ef6d4e",
  fontSize: 15,
  marginTop: -5,
  alignSelf: "flex-end",
  fontWeight: "700",
};
