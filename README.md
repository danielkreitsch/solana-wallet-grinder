# Solana Wallet Grinder

Command line tool that endlessly generates Solana wallets and compares the public key with a list of given prefixes. If the public key matches a prefix, the wallet data is stored locally, optionally encrypted with a password specified by the user.

## Installation

### Prerequisites

Ensure you have both `node` and `yarn` installed.

### Install the dependencies

```bash
yarn install
```

### Configure prefixes

Create a text file called `prefixes.txt` or copy and rename the `prefixes.txt.example`. Specify the desired prefixes for the public keys of the wallets you want to generate. For example, if you want to have public keys that start with `foo` or `bar`, the file should look like this:

```plain
foo
bar
```

## Usage

### Generate wallets
1. Run the tool: `yarn generate`
2. Enter a password to encrypt the private keys of the generated wallets. If you do not want to encrypt the private keys, leave the password field empty.
3. The tool will start generating wallets and saving them to the `wallets` folder.

### Decrypt private key

The private keys of the generated wallets are encrypted with a password of your choice. The encryption algorithm used is AES-256-CBC.

To decrypt a private key with this tool:
1. Run `yarn decrypt`
2. Enter the password you used for encryption
3. Enter the public key of the wallet from which you want to get the private key

## FAQ

### Can this tool be used to hack a wallet?

Guessing the private key of a wallet by endlessly generating key pairs would take billions of years. The number of possible combinations is so large that it is practically impossible to hack a wallet in this way.
