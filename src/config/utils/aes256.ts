import cryptoJs from 'crypto-js'

const IV = 'vcmcfuwerkczxvot'
const SK = '49058195125672156889317646787120'

// 암호화
export const encrypt = (text: string) => {
  const cipher = cryptoJs.AES.encrypt(text, cryptoJs.enc.Utf8.parse(SK), {
    iv: cryptoJs.enc.Utf8.parse(IV),
    padding: cryptoJs.pad.Pkcs7,
    mode: cryptoJs.mode.CBC
  })

  return encodeURIComponent(cipher.toString())
}

// 복호화
export const decrypt = (encryptedText: string) => {
  encryptedText = decodeURIComponent(encryptedText)
  const decipher = cryptoJs.AES.decrypt(encryptedText, cryptoJs.enc.Utf8.parse(SK), {
    iv: cryptoJs.enc.Utf8.parse(IV),
    padding: cryptoJs.pad.Pkcs7,
    mode: cryptoJs.mode.CBC
  })

  return decipher.toString(cryptoJs.enc.Utf8)
}

interface encryptedFileType {
  id: string
  bytes: stringNull
}

export const fileDownDecrypt = (encryptedFile: encryptedFileType) => {
  const fileInfo: encryptedFileType = {
    id: '',
    bytes: null
  }
  if (encryptedFile && encryptedFile.id) {
    fileInfo.id = decrypt(encryptedFile.id)
    fileInfo.bytes = atob(encryptedFile.bytes)
  }

  return fileInfo
}
