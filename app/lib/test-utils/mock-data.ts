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

export const holidays = [{"date":"2024-01-01","localName":"元日","name":"New Year's Day","countryCode":"JP","fixed":false,"global":true,"counties":null,"launchYear":null,"types":["Public"]},{"date":"2024-01-08","localName":"成人の日","name":"Coming of Age Day","countryCode":"JP","fixed":false,"global":true,"counties":null,"launchYear":null,"types":["Public"]},{"date":"2024-02-12","localName":"建国記念の日","name":"Foundation Day","countryCode":"JP","fixed":false,"global":true,"counties":null,"launchYear":null,"types":["Public"]},{"date":"2024-02-23","localName":"天皇誕生日","name":"The Emperor's Birthday","countryCode":"JP","fixed":false,"global":true,"counties":null,"launchYear":null,"types":["Public"]},{"date":"2024-03-20","localName":"春分の日","name":"Vernal Equinox Day","countryCode":"JP","fixed":false,"global":true,"counties":null,"launchYear":null,"types":["Public"]},{"date":"2024-04-29","localName":"昭和の日","name":"Shōwa Day","countryCode":"JP","fixed":false,"global":true,"counties":null,"launchYear":null,"types":["Public"]},{"date":"2024-05-03","localName":"憲法記念日","name":"Constitution Memorial Day","countryCode":"JP","fixed":false,"global":true,"counties":null,"launchYear":null,"types":["Public"]},{"date":"2024-05-04","localName":"みどりの日","name":"Greenery Day","countryCode":"JP","fixed":false,"global":true,"counties":null,"launchYear":null,"types":["Public"]},{"date":"2024-05-06","localName":"こどもの日","name":"Children's Day","countryCode":"JP","fixed":false,"global":true,"counties":null,"launchYear":null,"types":["Public"]},{"date":"2024-07-15","localName":"海の日","name":"Marine Day","countryCode":"JP","fixed":false,"global":true,"counties":null,"launchYear":null,"types":["Public"]},{"date":"2024-08-12","localName":"山の日","name":"Mountain Day","countryCode":"JP","fixed":false,"global":true,"counties":null,"launchYear":null,"types":["Public"]},{"date":"2024-09-16","localName":"敬老の日","name":"Respect for the Aged Day","countryCode":"JP","fixed":false,"global":true,"counties":null,"launchYear":null,"types":["Public"]},{"date":"2024-09-22","localName":"秋分の日","name":"Autumnal Equinox Day","countryCode":"JP","fixed":false,"global":true,"counties":null,"launchYear":null,"types":["Public"]},{"date":"2024-10-14","localName":"スポーツの日","name":"Sports Day","countryCode":"JP","fixed":false,"global":true,"counties":null,"launchYear":null,"types":["Public"]},{"date":"2024-11-04","localName":"文化の日","name":"Culture Day","countryCode":"JP","fixed":false,"global":true,"counties":null,"launchYear":null,"types":["Public"]},{"date":"2024-11-23","localName":"勤労感謝の日","name":"Labour Thanksgiving Day","countryCode":"JP","fixed":false,"global":true,"counties":null,"launchYear":null,"types":["Public"]}]
