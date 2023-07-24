import * as bitcoin from "bitcoinjs-lib";

export const BTC_DERIVATION_PATH = "m/84'/0'/0'/0";
export const LTC_DERIVATION_PATH = "m/84'/60'/0'/0";

export const Networks = {
  ...bitcoin.networks,
  litecoin: {
    messagePrefix: "\x19Litecoin Signed Message:\n",
    bech32: "ltc",
    bip32: {
      public: 0x019da462,
      private: 0x019d9cfe,
    },
    pubKeyHash: 0x30,
    scriptHash: 0x32,
    wif: 0xb0,
  },
};
