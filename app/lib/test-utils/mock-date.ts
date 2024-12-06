import {formatter} from '@/app/lib/helpers';

const [, , {value: month}, , {value: day}, , {value: year}] = formatter.formatToParts(new Date())

export const todayStr = `${year}-${month}-${day}`

export const todayRecord = {
  "id": "2e1fa58c-6b94-4c1a-8f03-d858453a66fb",
  "userid": "userid",
  "date": todayStr,
  "starttime": "09:18",
  "endtime": "18:00",
  "breaks": []
}

export const todayRecordWithNullEndtime = {
  "id": "2e1fa58c-6b94-4c1a-8f03-d858453a66fb",
  "userid": "userid",
  "date": todayStr,
  "starttime": "09:18",
  "endtime": null,
  "breaks": []
}

export const todayRecordWithNullEndtimeBreaks = {
  "id": "2e1fa58c-6b94-4c1a-8f03-d858453a66fb",
  "userid": "userid",
  "date": todayStr,
  "starttime": "09:18",
  "endtime": null,
  "breaks": [
    {
      "id": "ee2dfeef-eec5-41c9-8e9c-5c1008c27844",
      "recordId": "2e1fa58c-6b94-4c1a-8f03-d858453a66fb",
      "starttime": "09:18",
      "endtime": "09:30"
    },
    {
      "id": "f00c59c4-24e6-4113-9993-0f7f9f20688a",
      "recordId": "f1abe054-fb74-4f9d-80e1-fd2c8ceab4ce",
      "starttime": "12:00",
      "endtime": null
    },
  ]
}

export const todayRecordWithNonNullEndtimeBreaks = {
  "id": "2e1fa58c-6b94-4c1a-8f03-d858453a66fb",
  "userid": "userid",
  "date": todayStr,
  "starttime": "09:18",
  "endtime": null,
  "breaks": [
    {
      "id": "ee2dfeef-eec5-41c9-8e9c-5c1008c27844",
      "recordId": "2e1fa58c-6b94-4c1a-8f03-d858453a66fb",
      "starttime": "09:18",
      "endtime": "09:30"
    },
    {
      "id": "f00c59c4-24e6-4113-9993-0f7f9f20688a",
      "recordId": "f1abe054-fb74-4f9d-80e1-fd2c8ceab4ce",
      "starttime": "12:00",
      "endtime": "12:30"
    },
  ]
}

export const recordOfAnotherDay = {
  "id": "f1abe054-fb74-4f9d-80e1-fd2c8ceab4ce",
  "userid": "userid",
  "date": "2024-07-27",
  "starttime": "10:00",
  "endtime": "18:15",
  "breaks": []
}

export const breakWithNullEndtime = {
  "id": "ee2dfeef-eec5-41c9-8e9c-5c1008c27844",
  "recordId": "2e1fa58c-6b94-4c1a-8f03-d858453a66fb",
  "starttime": "09:18",
  "endtime": null
}

export const breakWithNonNullEndtime = {
  "id": "ee2dfeef-eec5-41c9-8e9c-5c1008c27844",
  "recordId": "2e1fa58c-6b94-4c1a-8f03-d858453a66fb",
  "starttime": "09:18",
  "endtime": "09:30"
}
