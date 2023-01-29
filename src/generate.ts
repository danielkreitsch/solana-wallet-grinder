import {Keypair} from "@solana/web3.js"
import * as bs58 from "bs58"
import * as readline from "readline"
import * as fs from "fs"
import * as crypto from "crypto"

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

function encryptKeypairSecret(keypair: Keypair, password: string)
{
    const key = crypto.scryptSync(password, "danielkreitsch.com", 32)
    const iv = Buffer.alloc(16)
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
    let encryptedSecretKey = cipher.update(bs58.encode(keypair.secretKey))
    encryptedSecretKey = Buffer.concat([encryptedSecretKey, cipher.final()])
    return encryptedSecretKey.toString("hex")
}

function startGenerating(password: string, startY: number) {
    let keypair: Keypair
    let publicKey: string

    let keypairsGenerated = 0
    let keypairsSaved = 0

    while (true) {
        keypair = Keypair.generate()
        publicKey = keypair.publicKey.toString()
        keypairsGenerated++

        if (publicKeyMatching(publicKey)) {
            bs58.encode(keypair.secretKey)
            if (password.length > 0) {
                fs.writeFileSync("wallets/" + publicKey, encryptKeypairSecret(keypair, password), "hex")
            } else {
                fs.writeFileSync("wallets/" + publicKey, bs58.encode(keypair.secretKey))
            }
            keypairsSaved++
        }

        process.stdout.cursorTo(0, startY + 7)
        process.stdout.write("Generated: " + keypairsGenerated + "\nSaved: " + keypairsSaved + "\n")
    }
}

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

console.log("Enter password to start generating wallets")
console.log("Leave the password empty to not encrypt the private key")
rl.question("Password: ", (password) => {
    startGenerating(password, rl.getCursorPos().rows)
    rl.close()
})


