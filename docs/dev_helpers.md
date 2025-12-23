# Dev Helpers

## Create reading (curl)

```bash
curl -X POST http://localhost:3000/api/readings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "meterId": "METER_ID",
    "readerAccountId": "ACCOUNT_ID",
    "readAt": "2024-01-15T09:00:00.000Z",
    "method": "photo_ocr",
    "value": 854,
    "imageFilename": "meter_METER_ID_2024-01.jpg"
  }'
```

