import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  FlatList,
  Image,
  LayoutAnimation,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
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

// TODO: FLATLIST SWIPE NOT WORKING
export default function App() {
  const [wallet, setWallet] = useState<WalletState>({
    addresses: [],
    root: null,
    key: "",
    adrIndex: 0,
  });

  const onClickmePressed = () => {
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

    setWallet((prev) => {
      return {
        addresses: [
          bitcoin.payments.p2wpkh({
            pubkey: child1.publicKey,
          }).address,
        ],
        key: mnemonic,
        adrIndex: prev.adrIndex + 1,
        root,
      };
    });
  };

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
        <Text
          style={{
            color: "white",
            fontSize: 15,
            marginTop: -5,
            alignSelf: "flex-end",
          }}
        >
          bytefederal testing
        </Text>
      </View>

      <FlatList
        data={[1, 2, 3]}
        contentContainerStyle={{
          flex: 1,
          alignContent: "stretch",
          marginTop: 24,
          marginBottom: 120,
        }}
        snapToAlignment="start"
        horizontal
        pagingEnabled
        snapToInterval={100}
        renderItem={({}) => (
          <View
            style={{
              backgroundColor: "#131313",
              width: "100%",
              borderRadius: 24,
              padding: 12,
            }}
          >
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {wallet.key.split(" ").map((word, index) => {
                if (word === "") return;

                return (
                  <View
                    style={{
                      height: 30,
                      paddingHorizontal: 12,
                      backgroundColor: "black",
                      justifyContent: "center",
                      borderRadius: 12,
                      margin: 2,
                    }}
                    key={index}
                  >
                    <Text style={{ color: "white", fontSize: 12 }}>{word}</Text>
                  </View>
                );
              })}
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 17, color: "white", fontWeight: "700" }}>
                Addresses
              </Text>

              {wallet.addresses.map((adr, index) => {
                return (
                  <View key={adr} style={[$row, { marginVertical: 6 }]}>
                    <View
                      style={{
                        borderRadius: 320,
                        borderColor: "red",
                        borderWidth: 1,
                        marginRight: 5,
                        height: 20,
                        width: 20,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "white" }}>{index}</Text>
                    </View>

                    <Text style={[$bodyText]}>{adr}</Text>
                  </View>
                );
              })}

              {wallet.addresses.length !== 0 && (
                <TouchableOpacity
                  onPress={onGenerateAddressPressed}
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    borderWidth: 1,
                    alignSelf: "center",
                    paddingLeft: 12,
                    paddingRight: 12,
                    paddingVertical: 5,
                    borderRadius: 12,
                    flexDirection: "row",
                  }}
                >
                  <Text style={[$bodyText, { fontSize: 12 }]}>
                    Generate New Address
                  </Text>
                  <Image
                    source={require("./assets/plus.png")}
                    style={{
                      width: 15,
                      height: 15,
                      marginLeft: 5,
                    }}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

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
  backgroundColor: "black",
  padding: 12,
  paddingTop: 60,
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

const $bodyText: TextStyle = {
  color: "white",
  fontSize: 13,
};

const $row: ViewStyle = {
  flexDirection: "row",
};
