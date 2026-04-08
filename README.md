# 🎓 CampusBot — AI-Powered College Assistant (Full-Stack)

CampusBot is a modern, role-based, AI-powered college assistant system designed to streamline academic operations and enhance student engagement. It provides structured dashboards for Students, Teachers, and Management while integrating a strictly controlled AI chatbot that only responds using verified database content.

---

## 🚀 Key Highlights

* 🔐 Secure JWT-based authentication system
* 🧑‍🤝‍🧑 Role-based dashboards (Student / Teacher / Management)
* 📅 Smart calendar with academic event filtering
* 🗳 Anonymous feedback system
* 💬 AI Chatbot powered by RAG (Retrieval-Augmented Generation)
* 🧠 Zero hallucination policy — strictly DB-driven responses
* ⚡ Fast responses (<5 seconds)
* 🎨 Clean, modern UI with consistent design system

---

## ⚠️ Core AI Constraint (IMPORTANT)

The chatbot strictly follows this rule:

> ❗ It ONLY answers using data stored in the database
> ❗ It NEVER generates external or assumed information
> ❗ If no relevant data is found, it ALWAYS responds with:

```
"I don't have that information yet — contact admin@oxford.edu"
```

---

## 🧑‍🤝‍🧑 User Roles

### 👨‍🎓 Student

* Access personalized dashboard
* View filtered academic calendar
* Submit feedback (anonymous supported)
* Use AI chatbot (RAG-based)
* View chat history and flag incorrect responses

### 👨‍🏫 Teacher

* Manage faculty data
* Create and manage calendar events
* View student feedback
* Contribute to knowledge base (feeds chatbot)

### 🏢 Management

* Manage fees, labs, offices, canteen, exam halls
* View feedback
* Maintain institutional data for chatbot

---

## 🔐 Authentication System

* Unified Login & Registration
* Role selection during signup
* JWT-based authentication
* Show/Hide password toggle
* No email verification required

### 🔁 Forgot Password Flow

* Email-based OTP verification
* Password reset after OTP validation

---

## 👤 Profile System

Each user can edit their profile.

### Student Fields

* Name, Email, Password
* USN
* Department
* Section
* Semester

### Teacher Fields

* Name, Email, Password
* SSN
* Department
* Sections (array)
* Semesters (array)

### Management Fields

* Name, Email, Password
* SSN
* Department

---

## 🎓 Student Dashboard

### 📅 Calendar

* Events:

  * 🔴 Deadlines
  * 🟡 Exams
  * 🟢 Holidays
* Filtered by student’s section & semester
* Auto-updates from teacher input

### 🗳 Feedback System

* Send feedback to Teacher or Management via SSN
* Anonymous option supported

### 💬 Chatbot

* Natural language interaction
* Chat history storage
* Clear chat option
* Flag incorrect answers
* Smart queries like:

  * “Who are my teachers?” → resolved via section + semester mapping

---

## 👨‍🏫 Teacher Dashboard

### 👥 Faculty Management (CRUD)

* Name, Department, Room Number, Availability

### 📅 Calendar Management

* Visual calendar UI (Google Calendar-like)
* Add/Edit/Delete:

  * Deadlines
  * Exams
  * Holidays
* Assign by section + semester

### 🗳 Feedback Viewer

* View feedback via SSN
* Supports anonymous messages

### 🧠 Knowledge Base Contribution

* All added data feeds chatbot system

---

## 🏢 Management Dashboard

### 💰 Fees Management

* Type (CET / Management)
* Year, Deadline

### 🧪 Labs Management

* Name, Building, Room, Timing

### 🏢 Offices Management

* Name, Purpose, Location, Timings

### 🍽 Canteen Management

* Location, Timings
* Weekly Menu (Mon–Sat)
* Used directly by chatbot

### 📝 Exam Hall Allocation

* Building, Hall, Class, Timing
* USN Range

### 🗳 Feedback Viewer

* View feedback via SSN

---

## 🧠 AI Chatbot (RAG Pipeline)

### Flow:

1. Convert DB data into embeddings
2. Store in FAISS (vector DB)
3. User query → embedding
4. Retrieve relevant data
5. Generate response ONLY from retrieved context

### Capabilities:

* Handles typos
* Understands vague queries
* Supports multi-question input
* Response time under 5 seconds

---

## 📦 Database Collections

* Users
* Faculty
* Labs
* Offices
* Fees
* Canteen (weekly menu)
* Exam Halls
* Calendar Events
* Feedback
* Flags
* Chat History

---

## ⚙️ Backend

* Node.js + Express
* MongoDB
* JWT Authentication

### APIs:

* Auth (register, login, forgot/reset password)
* CRUD for all modules
* Chatbot API (RAG-based)
* Feedback API
* Calendar API

---

## 🎨 Frontend

* React (Modern UI)
* Role-based dashboards
* Sidebar navigation
* Chat interface with history
* Interactive calendar UI

### 🎨 Color Palette

**Primary Accent**

* Teal: `#24A997`
* Light Teal: `#A0D0CA`

**Backgrounds**

* Main: `#FCFCFD`
* Cards: `#F5F7F8`

**Text**

* Primary: `#454952`
* Secondary: `#888A90`

---

## 🧱 Architecture Overview

```
Frontend (React)
   ↓
Backend (Node.js + Express)
   ↓
MongoDB (Primary Data Storage)
   ↓
Embedding Service → FAISS Vector DB
   ↓
LLM (Response generation from retrieved context only)
```

---

## 📌 Special Features

* 🔒 Strict non-hallucinating AI
* 📊 Fully role-based data isolation
* 🧠 Self-improving via knowledge base updates
* 🚩 Feedback + flagging loop for accuracy improvement

---

## 🛠 Setup Instructions

### 1. Clone Repository

```
git clone https://github.com/your-repo/campusbot.git
cd campusbot
```

### 2. Backend Setup

```
cd server
npm install
npm run dev
```

### 3. Frontend Setup

```
cd client
npm install
npm start
```

### 4. Environment Variables

Create `.env` in backend:

```
MONGO_URI=
JWT_SECRET=
EMAIL_SERVICE=
EMAIL_USER=
EMAIL_PASS=
```

---

## 📬 Flaws

* Canteen related questions aren't being answered
* The chatbot doesn't asnswer in natural language
* The flagged responses do not provide question that was flagged

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contribution

Contributions are welcome! Please open issues and submit pull requests for improvements.

---

## 📧 Contact

For support or missing information:

📩 [admin@oxford.edu](mailto:admin@oxford.edu)

---

**CampusBot — Smart. Secure. Structured.**
