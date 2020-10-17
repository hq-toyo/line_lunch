const https = require('https')   
const fs = require('fs')
require('dotenv').config()
process.env.APP_PATH = __dirname + '/'

const lib = require('./lib')
const msg = require(process.env.APP_PATH + 'message')

const PORT = process.env.PORT
const WEBHOOK_PATH = process.env.WEBHOOK_PATH
const USER_LIST_FILE = process.env.APP_PATH + 'userList.json'
const NO_LUNCH_FILE = process.env.APP_PATH + '__NO_LUNCH'

const userParam = { 
  key: fs.readFileSync(process.env.DUMMY_CERT_KEY),
  cert: fs.readFileSync(process.env.DUMMY_CERT_CRT),
  passphrase: '',
}

let isStop = false
const state = {}
let userList = {}
try {
  userList = JSON.parse(fs.readFileSync(USER_LIST_FILE))
  /*
  const newUserList = {}
  Object.keys(userList).forEach((userId) => {
    newUserList[userId] = { name: userList[userId].name, notify: true, }
  })
  fs.writeFileSync(USER_LIST_FILE, JSON.stringify(newUserList, null, 2))
  userList = newUserList
  */
} catch(e) {
  userList = {}
}

const messageList = {}
const message = {
  messageStamp: () => {
    /* Brown (line character) use a popper */
    return [{ type: 'sticker', packageId: '11537', stickerId: '52002734', quickReply: msg.quickReply, }]
  },
  follow: () => {
    /* Jessica (line character) gives hearts */
    return [{ type: 'text', text: '友達登録ありがとうございます！' }, { type: 'sticker', packageId: '11537', stickerId: '52002742' }, { type: 'text', text: 'まずは名前変更と入力して名前を設定してください！', quickReply: msg.quickReply, }]
  },
  unfollow: () => {
    /* Sally (line character) waves her hand */
    return [{ type: 'sticker', packageId: '11537', stickerId: '52002771', quickReply: msg.quickReply, }]
  },
  other: () => {
    /* Brown (line character) has questions */
    return [{ type: 'sticker', packageId: '11537', stickerId: '52002744', quickReply: msg.quickReply, }]
  },
}

const decodeAndReply = async (event) => {
  const userId = event.source.userId
  const text = event.message.text
  let replyMessage = [{ type: 'text', text: 'ボタンから選択してください', }]
  const oldState = state[userId]
  const userName = (userList[userId] || {}).name
  let noQuickReply = false
  let saveMessage = false

  if(oldState === msg.CHANGE_NAME) {
    const newName = text.replace('\n', '')
    userList[userId] = { name: newName, notify: ((userList[userId] || {}).notify || true), }
    replyMessage = [{ type: 'text', text: '名前を[' + newName + ']に設定しました！', }]
    fs.writeFileSync(USER_LIST_FILE, JSON.stringify(userList, null, 2))
  } else if(oldState === msg.OTHER) {
    replyMessage = [{ type: 'text', text: userName + 'さん，入力ありがとうございます！\n伝えておきますね！', }]
    saveMessage = true
  } else if(!userName && text !== msg.CHANGE_NAME) {
    replyMessage = [{ type: 'text', text: '名前変更と入力して，名前を設定してください！', }]
  } else if(text === msg.CHANGE_NAME) {
    replyMessage = [{ type: 'text', text: '名前を入力してください！', }]
    state[userId] = msg.CHANGE_NAME
    noQuickReply = true
  } else if(msg.STOP_LIST.indexOf(text) >= 0) {
    isStop = !isStop
    replyMessage = [{ type: 'text', text: userName + 'さん，お弁当の' + (isStop? '予約を締切りました！': '締切りを解除しました！'), }]
  } else if(text === msg.ALL_RESERVATION) {
    replyMessage = [{ type: 'text', text: userName + 'さん，全員分のメッセージを表示します！\n---------\n' + Object.values(messageList).join('\n') , }]
  } else if(isStop) {
    replyMessage = [{ type: 'text', text: userName + 'さん，お弁当の予約はもう締め切られています...\n必要であればさとみさんに直接連絡してください！', }]
  } else if(msg.YES_TEXT_LIST.indexOf(text) >= 0) {
    replyMessage = [{ type: 'text', text: userName + 'さん，お弁当を[1つ]用意しておきますね！\n連絡ありがとうございます．', }]
    saveMessage = true
  } else if(msg.YES2_TEXT_LIST.indexOf(text) >= 0) {
    replyMessage = [{ type: 'text', text: userName + 'さん，お弁当を[2つ]用意しておきますね！\n連絡ありがとうございます．', }]
    saveMessage = true
  } else if(msg.NO_TEXT_LIST.indexOf(text) >= 0) {
    replyMessage = [{ type: 'text', text: userName + 'さん，お弁当は[不要]ですね！\n連絡ありがとうございます．', }]
    saveMessage = true
  } else if(msg.NO_LUNCH_LIST.indexOf(text) >= 0) {
    try {
      fs.statSync(NO_LUNCH_FILE)
      fs.unlinkSync(NO_LUNCH_FILE)
      replyMessage = [{ type: 'text', text: userName + 'さん，明日のご飯通知は[こちら]で購入するように通知します．', }]
    } catch(e) {
      fs.writeFileSync(NO_LUNCH_FILE, '@')
      replyMessage = [{ type: 'text', text: userName + 'さん，明日のご飯通知は[各自]で購入してもらうように通知します．', }]
    }
  } else if(text === msg.NOTIFY_EVERYDAY) {
    userList[userId].notify = !userList[userId].notify
    if(userList[userId].notify) {
      replyMessage = [{ type: 'text', text: userName + 'さん，平日の朝8:30に毎日通知します！', }]
    } else {
      replyMessage = [{ type: 'text', text: userName + 'さん，毎日の通知をオフにしました！', }]
    }
    fs.writeFileSync(USER_LIST_FILE, JSON.stringify(userList, null, 2))
  } else if(msg.OTHER === text) {
    replyMessage = [{ type: 'text', text: userName + 'さん，誰のお弁当が必要か名前を全員分入力してください！', }]
    noQuickReply = true
    state[userId] = msg.OTHER
  }

  if(oldState === state[userId]) {
    delete state[userId]
  }
  if(!noQuickReply) {
    replyMessage[replyMessage.length - 1].quickReply = msg.quickReply
  }
  if(saveMessage) {
    messageList[userName] = userName  + '(' + lib.formatDate(new Date(), 'hh:mm') + ')「' + text + '」'
  }
  const lineResult = await lib.replyMessage(event.replyToken, replyMessage)
  console.log('result:', lineResult.err, lineResult.body)
}

https.createServer(userParam, (req, res) => {    
  if(req.url !== WEBHOOK_PATH || req.method !== 'POST') {
    console.log('invalid access:', req.method, req.url)
    res.writeHead(200, {'Content-Type': 'text/plain'})
    return res.end('')
  }

  let body = ''
  let eventList = []
  req.on('data', (chunk) => {
    body += chunk
  })        
  req.on('end', async () => {
    console.log('body', body)
    if(!body) {
      console.log('body is empty')
      res.writeHead(200, {'Content-Type': 'text/plain'})
      res.end('')
      return
    }

    console.log('request:', body)
    eventList = JSON.parse(body).events
    for(let event of eventList) {
      try {
        console.log('event:', event)
        if(event.type === 'message') {
          if(event.message.type === 'text') {
            decodeAndReply(event)
          } else {
            const lineResult = await lib.replyMessage(event.replyToken, message.messageStamp())
            console.log('result:', lineResult.err, lineResult.body)
          }
        } else if(event.type === 'follow') {
          const lineResult = await lib.replyMessage(event.replyToken, message.follow())
          console.log('result:', lineResult.err, lineResult.body)
        } else if(event.type === 'unfollow') {
          const lineResult = await lib.pushMessage(event.source.userId, message.unfollow())
          console.log('result:', lineResult.err, lineResult.body)
        } else {
          const lineResult = await lib.replyMessage(event.replyToken, message.other())
          console.log('result:', lineResult.err, lineResult.body)
        }
      } catch(e) {
        console.log('error:', e)
        const lineResult = await lib.replyMessage(event.replyToken, [{ type: 'text', text: '申し訳ありません．データを処理できませんでした．' }])
        console.log('result:', lineResult.err, lineResult.body)
      }
    }
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('')
  })
  req.on('error', async (e) => {
    console.log('error:', e)
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end()

    for(let event of eventList) {
      const lineResult = await lib.replyMessage(event.replyToken, [{ type: 'text', text: '申し訳ありません．データを処理できませんでした．' }])
      console.log('result:', lineResult.err, lineResult.body)
    }
  })
}).listen(PORT, () => {
  console.log('server start at port[', PORT, ']')
})


