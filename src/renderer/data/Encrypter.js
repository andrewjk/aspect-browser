import crypto from 'crypto'

// Crypto code from http://vancelucas.com/blog/stronger-encryption-and-decryption-in-node-js/

export default function (masterPassword) {
  this.masterPassword = masterPassword

  this.encrypt = (text) => {
    const ivLength = 16
    console.log(this.masterPassword)
    let iv = crypto.randomBytes(ivLength)
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(padPassword(this.masterPassword)), iv)
    let encrypted = cipher.update(text)

    encrypted = Buffer.concat([encrypted, cipher.final()])

    return iv.toString('hex') + ':' + encrypted.toString('hex')
  }

  this.decrypt = (text) => {
    let textParts = text.split(':')
    let iv = Buffer.from(textParts.shift(), 'hex')
    let encryptedText = Buffer.from(textParts.join(':'), 'hex')
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(padPassword(this.masterPassword)), iv)
    let decrypted = decipher.update(encryptedText)

    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString()
  }

  function padPassword (password) {
    return (password + 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx').substring(0, 32)
  }
}
