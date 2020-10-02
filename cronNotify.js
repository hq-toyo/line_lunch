const fs = require('fs')

require('dotenv').config()
process.env.APP_PATH = __dirname + '/'

const lib = require(process.env.APP_PATH + 'lib')
const USER_LIST_FILE = process.env.APP_PATH + 'userList.json'
const msg = require(process.env.APP_PATH + 'message')

/* send debugger only */
const DEBUG_MODE = false
const DEBUG_USER = process.env.DEBUG_USER

const main = async () => {
  let userList = null
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
    if(DEBUG_MODE && clientUserId !== DEBUG_USER) {
      continue
    }
    const userName = userList[clientUserId]
    const lineResult = await lib.pushMessage(clientUserId, [{ type: 'text', text: userName + 'さん，今日のお昼ご飯はどうしますか？', quickReply: msg.quickReply, }])
    console.log('result:', lineResult.err, lineResult.body)
  }
  process.exit(0)
}

main()

