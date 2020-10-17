const CHANGE_NAME = '名前変更'
const ALL_RESERVATION = 'みんなの予約'
const OTHER = 'その他'
const NOTIFY_EVERYDAY = '平日通知'
const STOP_LIST = ['締め切り', '締切', '締切り', 'しめきり', '終わり']
const NO_LUNCH_LIST = ['明日は各自']
const YES_TEXT_LIST = ['はーい', 'いる', 'はい', '必要', '必要です', '有り', '有りです', 'あり', 'ありです', 'うん', '1個', 'ひとつ', '1つだけ']
const YES2_TEXT_LIST = ['2個', 'ふたつ', '2つだけ']
const NO_TEXT_LIST = ['いいえ', 'いらない', '不要', '要らない', '要らないです', 'いらないです', '休み', '休みます', '休みです']


const quickReply =  {
  'items': [
    {
      'type': 'action',
      'action': {
        'type': 'message',
        'label': '1つだけ',
        'text': '1つだけ',
      }
    },
    {
      'type': 'action',
      'action': {
        'type': 'message',
        'label': '2つだけ',
        'text': '2つだけ',
      }
    },
    {
      'type': 'action',
      'action': {
        'type': 'message',
        'label': OTHER,
        'text': OTHER,
      }
    },
    {
      'type': 'action',
      'action': {
        'type': 'message',
        'label': '不要',
        'text': '不要',
      }
    },
    {
      'type': 'action',
      'action': {
        'type': 'message',
        'label': CHANGE_NAME,
        'text': CHANGE_NAME,
      }
    },
    {
      'type': 'action',
      'action': {
        'type': 'message',
        'label': ALL_RESERVATION,
        'text': ALL_RESERVATION,
      }
    },
    {
      'type': 'action',
      'action': {
        'type': 'message',
        'label': NOTIFY_EVERYDAY,
        'text': NOTIFY_EVERYDAY,
      }
    },
  ]
}

module.exports = {
  quickReply,
  CHANGE_NAME,
  ALL_RESERVATION,
  OTHER,
  STOP_LIST,
  YES_TEXT_LIST,
  YES2_TEXT_LIST,
  NO_TEXT_LIST,
  NOTIFY_EVERYDAY,
  NO_LUNCH_LIST,
}

