const records = [
  {
    "id": "2e1fa58c-6b94-4c1a-8f03-d858453a66fb",
    "date": "2024-07-27",
    "starttime": "09:18",
    "endtime": "18:00"
  },
  {
    "id": "f1abe054-fb74-4f9d-80e1-fd2c8ceab4ce",
    "date": "2024-07-27",
    "starttime": "10:00",
    "endtime": "18:15"
  },
  {
    "id": "2fe37ed4-bc05-4029-8970-451f765f9554",
    "date": "2024-07-27",
    "starttime": "09:00",
    "endtime": "17:55"
  }
]

const breaks = [
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
    "endtime": "13:05"
  },
  {
    "id": "73d95f57-a7c8-42e0-a895-3f4eb99d7906",
    "recordId": "f1abe054-fb74-4f9d-80e1-fd2c8ceab4ce",
    "starttime": "16:15",
    "endtime": "16:50"
  },
]

module.exports = {
  records,
  breaks
}
