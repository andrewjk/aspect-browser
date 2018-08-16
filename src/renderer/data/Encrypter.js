import crypto from 'crypto'

// Crypto code from http://vancelucas.com/blog/stronger-encryption-and-decryption-in-node-js/

export default function (password) {
  this.password = password

  this.encrypt = (text) => {
    const ivLength = 16
    const iv = crypto.randomBytes(ivLength)
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(padPassword(this.password)), iv)

    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])

    return iv.toString('hex') + ':' + encrypted.toString('hex')
  }

  this.decrypt = (text) => {
    const textParts = text.split(':')
    const iv = Buffer.from(textParts.shift(), 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(padPassword(this.password)), iv)

    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString()
  }

  function padPassword (password) {
    return (password + 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx').substring(0, 32)
  }
}
