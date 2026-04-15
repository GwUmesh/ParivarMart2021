Before building the "Parivar Mart" website, first set up and connect all required services properly.

IMPORTANT:

* Do NOT start building features until all connections are verified
* First ensure backend, database, and authentication are fully working

---

⚙️ STEP 1: PROJECT STRUCTURE

Create proper structure:

* /backend (Node.js + Express)
* /frontend (Next.js)
* /admin (can be inside frontend or separate)

---

🗄️ STEP 2: MONGODB SETUP

* Use MongoDB Atlas (cloud)

* Create database: parivar_mart

* Create collections:

  * users
  * products
  * orders
  * categories
  * reviews
  * promocodes

* Connect backend using Mongoose

* Store connection string in .env:
  MONGO_URI=your_connection_string

* Verify connection:

  * Log “MongoDB Connected”

---

🔥 STEP 3: FIREBASE SETUP (GOOGLE LOGIN)

* Create Firebase project

* Enable Google Authentication

* Get config:

  * API key
  * Auth domain

* Add to frontend .env:
  NEXT_PUBLIC_FIREBASE_API_KEY
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

* Implement Google Sign-In in frontend

* Send ID token to backend

* Backend verifies token and creates user

---

🔐 STEP 4: ENVIRONMENT VARIABLES

Create .env files:

Backend:

* MONGO_URI=
* JWT_SECRET=
* EMAIL_USER=
* EMAIL_PASS=
* GOOGLE_CLIENT_ID=

Frontend:

* NEXT_PUBLIC_API_URL=
* Firebase keys

IMPORTANT:

* Do not hardcode secrets

---

🌐 STEP 5: BACKEND SERVER

* Setup Express server

* Enable:

  * CORS
  * JSON parsing

* Create test route:
  /api/test → return “API working”

---

🔗 STEP 6: FRONTEND CONNECTION

* Connect frontend to backend using API base URL
* Test API call from frontend
* Ensure no CORS error

---

📧 STEP 7: NODEMAILER SETUP

* Configure SMTP (Gmail)
* Send test email

---

🧪 STEP 8: CONNECTION TESTING

Test all:

✅ MongoDB connected
✅ Firebase login working
✅ Backend running
✅ Frontend calling API
✅ Email sending working

---

⚠️ RULES:

* Do NOT proceed if any step fails
* Fix errors immediately
* Log everything clearly

---

📁 OUTPUT:

* Working connections
* .env setup
* Test results

---

🎯 GOAL:
A fully connected and stable foundation before building features.
