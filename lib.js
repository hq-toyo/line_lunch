const crypto = require('crypto')
const spawn = require('child_process').spawn
const request = require('request')

require('dotenv').config()
const CLIENT_USER_ID = process.env.CLIENT_USER_ID
const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN
const CHANNEL_SECRET = process.env.CHANNEL_SECRET

const signature = crypto.createHmac('sha256', CHANNEL_SECRET)

const pushMessage = (to, messageList) => {
  return new Promise((resolve, reject) => {
    if(!to) {
      to = CLIENT_USER_ID
    }
    const json = {
      messages: messageList,
      to: to,
    }
    const conf = {
      url: 'https://api.line.me/v2/bot/message/push',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Line-Signature': signature,
        'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(json)),
      },
      json: json
    }
    request.post(conf, (err, res, body) => {
      resolve({ err, res, body, })
    })
  })
}

const replyMessage = (recipient, messageList) => {
  return new Promise((resolve, reject) => {
    const json = {
      messages: messageList,
      replyToken: recipient,
    }
    const conf = {
      url: 'https://api.line.me/v2/bot/message/reply',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Line-Signature': signature,
        'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(json)),
      },
      json: json
    }
    request.post(conf, (err, res, body) => {
      resolve({ err, res, body, })
    })
  })
}

const apiRequest = (isPost, url, param = {}, header = {}, json = true) => {
  return new Promise((resolve, reject) => {
    const query = param && Object.keys(param).map((key) => { return key + '=' + param[key] }).join('&')
    const opt = {
      method: isPost? 'POST': 'GET',
      url: url + (isPost? '': (query? '?' + query: '')),
      headers: Object.assign({
      }, header),
      timeout: 30 * 1000,
    }
    if(json) {
      opt.json = json
    }
    if(isPost && param) {
      opt.body = json? (post? (param? param: {}): {}): param.toString()
    }
    request(opt, (error, res, body) => {
      // usually use 'body'
      resolve({ error, res, body, })
    })
  })
}

const formatDate = (date, format) => {
  return (format || 'YYYY-MM-DD hh:mm:ss').replace(/YYYY/g, date.getFullYear())
    .replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2))
    .replace(/DD/g, ('0' + date.getDate()).slice(-2))
    .replace(/hh/g, ('0' + date.getHours()).slice(-2))
    .replace(/mm/g, ('0' + date.getMinutes()).slice(-2))
    .replace(/ss/g, ('0' + date.getSeconds()).slice(-2))
}

const getArrayInfo = (array) => {
  const average = array.reduce((previous, current) =>
    previous + current  
  ) / array.length  
  const standardDeviation = Math.sqrt(  
    array.map((current) => {  
      let difference = current - average  
      return difference ** 2  
    })
    .reduce((previous, current) =>
      previous + current  
    ) / array.length  
  )
  return { average, standardDeviation, }
}

const fork = (commandList) => {
  return new Promise((resolve, reject) => {
    const list = []
    const proc = spawn(commandList[0], commandList.slice(1), { shell: true, })
    console.log('[info] start spawn:', commandList)

    proc.stderr.on('data', (err) => {
      // console.error('stderr:', err.toString())
    })
    proc.stdout.on('data', (data) => {
      //      console.log('stdout:', data.toString())
      const result = ((data || '').toString() || '').slice(0, -1).split(',')
      list.push(result)
    })
    proc.on('close', (code) => {
      console.log('[info] end spawn', code, commandList)
      resolve(list)
    })
  })
}



module.exports = {
  pushMessage,
  replyMessage,
  apiRequest,
  formatDate,
  getArrayInfo,
  fork,
}
