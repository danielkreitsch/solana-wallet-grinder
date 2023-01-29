import {Keypair} from "@solana/web3.js"
import * as bs58 from "bs58"
import * as readline from "readline"
import * as fs from "fs"
import * as crypto from "crypto"
import * as bip39 from "bip39"
import {derivePath} from "ed25519-hd-key";

// Create folder for keypairs
if (!fs.existsSync("wallets")) {
    fs.mkdirSync("wallets")
}

// Load list of prefixes
let prefixes: string[] = fs.readFileSync("prefixes.txt").toString().split("\n").map(s => s.toLowerCase())

function publicKeyMatching(publicKey: string): boolean {
    const publicKeyLowercase = publicKey.toLowerCase()
    for (let i in prefixes) {
        if (publicKeyLowercase.startsWith(prefixes[i])) {
            return true
        }
    }
    return false
}

function encrypt(secret: string, password: string) {
    const key = crypto.scryptSync(password, "danielkreitsch.com", 32)
    const iv = Buffer.alloc(16)
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
    let encryptedSecretKey = cipher.update(secret)
    encryptedSecretKey = Buffer.concat([encryptedSecretKey, cipher.final()])
    return encryptedSecretKey.toString("hex")
}

function startGenerating(mode: Mode, password: string, startY: number) {
    let mnemonic: string
    let keypair: Keypair
    let publicKey: string
    let secret: string

    let walletsGenerated = 0
    let walletsSaved = 0

    while (true) {
        if (mode == Mode.RecoveryPhrase) {
            mnemonic = bip39.generateMnemonic()
            const seed = bip39.mnemonicToSeedSync(mnemonic, "")
            keypair = Keypair.fromSeed(derivePath("m/44'/501'/0'/0'", seed.toString("hex")).key)
            secret = mnemonic
        } else if (mode == Mode.PrivateKey) {
            keypair = Keypair.generate()
            secret = bs58.encode(keypair.secretKey)
        } else {
            throw new Error("Invalid mode")
        }

        publicKey = keypair.publicKey.toString()
        walletsGenerated++

        if (publicKeyMatching(publicKey)) {
            if (password.length > 0) {
                fs.writeFileSync("wallets/" + publicKey, encrypt(secret, password), "hex")
            } else {
                fs.writeFileSync("wallets/" + publicKey, secret)
            }
            fs.writeFileSync("wallets.txt", publicKey + "\n", {flag: "a"})
            walletsSaved++
        }

        process.stdout.cursorTo(0, startY + 7)
        process.stdout.write("Generated: " + walletsGenerated + "\nSaved: " + walletsSaved + "\n")
    }
}

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

console.log("Choose mode\n1) Recovery phrase\n2) Private key")
rl.question("Mode: ", (modeInput) => {
    let mode = parseInt(modeInput)
    if (mode != Mode.RecoveryPhrase && mode != Mode.PrivateKey) {
        console.log("Invalid mode")
        process.exit()
    }
    console.log("Enter password (Leave it empty to not encrypt the private key)")
    rl.question("Password: ", (password) => {
        startGenerating(mode, password, rl.getCursorPos().rows)
        rl.close()
    })
})

enum Mode {
    RecoveryPhrase = 1,
    PrivateKey = 2
}
