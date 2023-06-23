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

// TODO: FLATLIST SWIPE NOT WORKING
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

          <Image
            source={require("./assets/bf-logo.png")}
            style={{ width: 60, height: 60, marginLeft: 12 }}
          />
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

      <FlatList
        data={[1, 2, 3, 4]}
        numColumns={2}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ width: 6, height: 6 }} />}
        renderItem={({ item, index }) => {
          return (
            <View
              style={{
                flex: 1 / 2,
                height: 170,
                marginRight: index % 2 === 0 ? 6 : 0,
                backgroundColor: "#2b2e2f",
                borderRadius: 24,
                padding: 12,
              }}
            >
              {index === 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={[$bodyText, { fontWeight: "700" }]}>
                    Receive
                  </Text>
                </View>
              )}

              {index === 1 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={[$bodyText, { fontWeight: "700" }]}>
                    Addresses
                  </Text>

                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <Icon
                      name="plus"
                      type="feather"
                      color="#828284"
                      size={10}
                    />
                    <Text style={{ color: "#828284" }}>New</Text>
                  </TouchableOpacity>
                </View>
              )}

              {index === 2 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={[$bodyText, { fontWeight: "700" }]}>
                    Transactions
                  </Text>
                </View>
              )}

              {index === 3 && (
                <View style={{ flexDirection: "column", flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={[$bodyText, { fontWeight: "700" }]}>
                      Private Key
                    </Text>

                    <TouchableOpacity
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Icon
                        name="copy"
                        type="feather"
                        color="#828284"
                        size={10}
                      />
                      <Text style={{ color: "#828284", marginLeft: 3 }}>
                        Copy
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <Text style={{ color: "white" }}>{wallet.key}</Text>
                  </View>
                </View>
              )}
            </View>
          );
        }}
      />

      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <TouchableOpacity style={$button}>
          <Text style={{ color: "white", fontSize: 17, fontWeight: "600" }}>
            Send
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={$button}>
          <Text style={{ color: "white", fontSize: 17, fontWeight: "600" }}>
            Receive
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const $root: ViewStyle = {
  flex: 1,
  backgroundColor: "#181818",
  padding: 12,
  paddingTop: 60,
};

const $button: ViewStyle = {
  backgroundColor: "#1E1E1E",
  borderRadius: 20,
  width: "42%",
  height: 50,
  alignSelf: "center",
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
