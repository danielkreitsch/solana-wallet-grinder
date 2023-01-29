import * as readline from "readline"
import * as fs from "fs"
import * as crypto from "crypto"

function decrypt(encrypted: string, password: string) {
    const key = crypto.scryptSync(password, "danielkreitsch.com", 32)
    const iv = Buffer.alloc(16)
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv)
    let decrypted = decipher.update(Buffer.from(encrypted, "hex"))
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
}

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

console.log("Enter password to get the private key of a wallet")
rl.question("Password: ", (password) => {
    let recursiveReadLine = () => {
        rl.question("Public key: ", (publicKey) => {
            if (publicKey.length == 0) {
                return rl.close()
            }
            try {
                const encrypted = fs.readFileSync("wallets/" + publicKey, "hex")
                try {
                    const secret = decrypt(encrypted, password)
                    console.log(" Result: " + secret)
                } catch (e) {
                    console.error(" Wrong password")
                }
            } catch (e) {
                console.error(" Wallet not found")
            }
            recursiveReadLine()
        })
    }
    recursiveReadLine()
})
