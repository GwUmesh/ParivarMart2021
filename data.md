Build a complete full-stack supermarket web app named "Parivar Mart" using a structured 4-agent approach.

IMPORTANT:

* Execute ONE agent at a time
* Do NOT run all agents together
* Build step-by-step stable system

---

🎨 UI THEME:
Use premium teal color palette:

* #0FC2C0
* #0CABA8
* #008F8C
* #015958
* #023535

---

👨‍💻 AGENT 1: BACKEND DEVELOPMENT

TASK:
Build backend using Node.js + Express + MongoDB

FEATURES:

📦 PRODUCTS:

* Add/Edit/Delete products
* Multiple images
* Price, discount, stock

📂 CATEGORIES:

* Oils, Biscuits, Detergents, Snacks, Beverages (NO fruits/vegetables)

👤 USERS:

* Google OAuth login
* Store user data (name, email, profile pic)

🛒 CART & ORDER:

* Create order
* Store items, pricing, address

💰 PRICING LOGIC:

* Minimum order ₹100 (dynamic – editable from admin)
* ₹100–₹999 → ₹40 delivery + ₹3 platform fee
* ₹1000+ → FREE delivery + FREE platform fee

🎟️ PROMOCODE SYSTEM (IMPORTANT):

* Create promocode model:

  * Code
  * Discount type (flat / percentage)
  * Value
  * Minimum order condition
  * Expiry date
* Apply promocode during checkout
* Validate:

  * Expiry
  * Min order
* Apply discount to total

🧾 INVOICE:

* Generate invoice number (PM-YYYY-XXXX)
* Send email via Nodemailer

🔐 ADMIN:

* Login (bcrypt)
* Forgot password (email reset)

STOP after backend is working.

---

🎨 AGENT 2: FRONTEND DEVELOPMENT

TASK:
Build frontend using Next.js + Tailwind

PAGES:

* Home
* Product listing
* Product details
* Cart
* Checkout
* Profile
* Admin panel

FEATURES:

🛒 CART:

* Add/remove/update items
* Show pricing breakdown

🛍️ CHECKOUT:

📍 ADDRESS:

* Full structured form
* Save multiple addresses

💡 SMART SUGGESTIONS:

* Show “Add more items” suggestions
* Example:

  * “Add ₹100 more for free delivery”
  * “Customers also bought…”

🎟️ PROMOCODE UI:

* Input field: “Apply Promocode”
* Show success/error message
* Update total dynamically

💰 SHOW:

* Subtotal
* Delivery
* Platform fee
* Discount (promocode)
* Final total

⭐ REVIEWS:

* Add rating + review
* Display reviews

STOP after frontend works.

---

🔐 AGENT 3: AUTH & SECURITY

TASK:

* Implement Google login (Firebase or OAuth)
* Verify token in backend
* Protect routes:

  * Admin routes
  * User routes
* Secure APIs (JWT)
* Admin password hashing

STOP after auth works.

---

🧑‍💼 AGENT 4: ADMIN PANEL + TESTING

TASK:

📊 ADMIN FEATURES:

* Dashboard (orders, users, revenue)

📦 PRODUCTS:

* Add/Edit/Delete
* Bulk upload

📂 CATEGORY MANAGEMENT

🎟️ PROMOCODE MANAGEMENT (IMPORTANT):

* Create promocodes
* Edit/delete promocodes
* Set:

  * Discount
  * Expiry
  * Min order

📦 ORDERS:

* View + update status

👤 USERS:

* View/block users

⭐ REVIEWS:

* Approve/reject reviews

⚙️ SETTINGS:

* Change minimum order value dynamically

---

🧪 FINAL TEST FLOW:

1. Login
2. Add product
3. View product
4. Add to cart
5. Apply promocode
6. Checkout
7. Place order
8. Invoice email sent

Fix all bugs if found.

---

🎯 FINAL GOAL:
A complete supermarket system with:

* Smart checkout
* Promocode system
* Reviews
* Admin control
* Stable working flow


🏬 SHOP NAME:
Parivar Mart

🏷️ TAGLINE:
Your Family’s Trusted Store Since 2021

📍 ADDRESS:
Parade Corner, Rasayani,
Raigad – 410220, Maharashtra, India

📌 COORDINATES:
Latitude: 18.893193793560698
Longitude: 73.17058481590631

🗺️ GOOGLE MAP LINK:
https://maps.app.goo.gl/K1mgfq9vpJYAD6bR7

📞 CONTACT NUMBER:
+91 7021716914

📧 EMAIL:
[parivarmart399@gmail.com](mailto:parivarmart399@gmail.com)

📸 INSTAGRAM:
https://instagram.com/parivar_mart_2021/

📅 ESTABLISHED:
Since 2021

---

💼 BUSINESS TYPE:
Supermarket / Grocery Store

🛒 PRODUCT CATEGORIES:

* Oils
* Biscuits
* Detergents
* Snacks
* Beverages
* Household Items

---

🚚 SERVICES:

* Home Delivery
* Store Pickup

---


Provide fast, reliable, and premium grocery shopping experience.
