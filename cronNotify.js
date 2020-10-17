const fs = require('fs')

require('dotenv').config()
process.env.APP_PATH = __dirname + '/'

const lib = require(process.env.APP_PATH + 'lib')
const USER_LIST_FILE = process.env.APP_PATH + 'userList.json'
const NO_LUNCH_FILE = process.env.APP_PATH + '__NO_LUNCH'
const msg = require(process.env.APP_PATH + 'message')
const PLACE_HOLDER = '{USER_NAME}'

/* send debugger only */
const DEBUG_MODE = false
const DEBUG_USER = process.env.DEBUG_USER
const debugUserList = []

const main = async () => {
  let userList = null
  let messageLine = [{ type: 'text', text: PLACE_HOLDER + 'さん，今日のお昼ご飯はどうしますか？', quickReply: msg.quickReply, }]
  try {
    fs.statSync(NO_LUNCH_FILE)
    fs.unlinkSync(NO_LUNCH_FILE)
    messageLine = [{ type: 'text', text: PLACE_HOLDER + 'さん，今日のご飯は各自で購入してください！入力されても購入しません．', }]
  } catch(e) {
  }

  try {
    userList = JSON.parse(fs.readFileSync(USER_LIST_FILE))
  } catch(e) {
    const lineResult = await lib.pushMessage(DEBUG_USER, [{ type: 'text', text: '[報告] ユーザーファイルが不正です！お弁当通知を送信できませんでした！', quickReply: msg.quickReply, }])
    console.log('result:', lineResult.err, lineResult.body)
    process.exit(0)
  }
  if(DEBUG_MODE) {
    const lineResult = await lib.pushMessage(DEBUG_USER, [{ type: 'text', text: '[報告] デバッグモードです！', quickReply: msg.quickReply, }])
    console.log('result:', lineResult.err, lineResult.body)
  }
  for(let clientUserId of Object.keys(userList)) {
    const userName = userList[clientUserId].name
    if(DEBUG_MODE && clientUserId !== DEBUG_USER && debugUserList.indexOf(userName) < 0) {
      console.log('[debug] ignore userId:', clientUserId, userName)
      continue
    }
    if(!userList[clientUserId].notify) {
      console.log('[debug] ignore not notify user:', clientUserId, userName)
      continue
    }
    console.log(messageLine.map((line) => { return Object.assign(line, { text: line.text.replace(PLACE_HOLDER, userName), }) }))
    const lineResult = await lib.pushMessage(clientUserId, messageLine.map((line) => { return Object.assign(line, { text: line.text.replace(PLACE_HOLDER, userName), }) }))
    console.log('result:', userName, lineResult.err, lineResult.body)
  }
  process.exit(0)
}

main()

