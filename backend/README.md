# Backend (Node/Express)

Two jobs:
1. **Push (FCM):** watches `trips` in Firestore and notifies the driver when a request (`requested`) appears.
2. **Mercado Pago (test):** creates the Checkout Pro preference, verifies the payment with the Mercado Pago API, marks the trip `paid` and credits the driver balance.

## Run
```bash
cd backend
npm install
cp .env.example .env   # fill MP_ACCESS_TOKEN and the service-account path
npm start
```
Check: http://localhost:3000/health -> `{"ok":true}`

Secrets (`.env`, `serviceAccountKey.json`) are in `.gitignore` and must never be committed.
