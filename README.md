# SMART FACE RECOGNITION ATTENDANCE SYSTEM

Production-ready Smart Face Recognition Attendance System for organizations and universities, featuring real facial biometric detection, 128-dimensional LBP+HOG feature extraction, cosine similarity matching, 1-second live attendance polling, authoritative server timestamp verification, Supabase PostgreSQL with Row Level Security (RLS), and multi-tenant organization isolation.

---

## Architecture Overview

```
                      USERS / STUDENTS / FACULTY
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
              Android App                  Web Browser
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                   React Native + Expo Router + NativeWind
                                  │
                                  ▼
                     Vercel (Frontend Hosting)
                                  │
                              HTTPS / REST
                                  │
                                  ▼
                Spring Boot Backend (Java 17/21 + Maven)
                                  │
                                  ▼
                 Supabase PostgreSQL (Database + RLS)
```

---

## Directory Structure

```
c:/CV/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/smartattendance/
│   │   │   │   ├── config/          # Security & Database Seeders
│   │   │   │   ├── controller/      # REST API Endpoints
│   │   │   │   ├── service/         # Business Logic Layer
│   │   │   │   ├── repository/      # Spring Data JPA Repositories
│   │   │   │   ├── entity/          # 15 Relational JPA Entities
│   │   │   │   ├── dto/             # API Data Transfer Objects
│   │   │   │   ├── security/        # JWT Authentication & Authorization Filters
│   │   │   │   ├── exception/       # Global Exception Handler & API Error Envelopes
│   │   │   │   ├── face/            # Pure Java Real Face CV Engine & Biometrics
│   │   │   │   ├── attendance/      # Sessions, 1s Live Polling, CSV/PDF Reports
│   │   │   │   └── util/
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── data.sql
│   │   │       └── schema-supabase.sql # Complete Supabase Schema with RLS
│   ├── pom.xml
│   ├── render.yaml                  # Render Production Deployment Spec
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── (auth)/login.tsx
│   │   ├── (admin)/                 # Organization, Faculty, Students, Reports, Settings, Logs
│   │   ├── (faculty)/               # Live Scanner, 1s Polling, Face Enrollment, Reports
│   │   └── (student)/               # Overview, Calendar, Face ID Registration, History
│   ├── src/
│   │   ├── components/              # FaceCameraModal, Badge, StatCard, Card, Button, Header
│   │   ├── store/authContext.tsx    # Secure session & role routing
│   │   ├── api/client.ts            # Centralized Axios with JWT interceptor & auto-refresh
│   │   ├── lib/storage.ts           # Expo SecureStore with Web fallback
│   │   ├── lib/supabase.ts          # Supabase Client
│   │   ├── types/index.ts           # Full TypeScript types
│   │   └── theme/colors.ts          # Present/Late/Absent status theme tokens
│   ├── app.json
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json                  # Vercel Deployment Spec
│   ├── .env
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## Seed Credentials (ABC University)

The backend auto-seeds development sample data on first run:

| Role | Email | Password | Identification # |
| :--- | :--- | :--- | :--- |
| **Organization Admin** | `admin@abc.edu` | `Password123!` | System Admin |
| **Faculty 001** | `faculty1@abc.edu` | `Password123!` | `FAC001` (Prof. Alan Turing) |
| **Faculty 002** | `faculty2@abc.edu` | `Password123!` | `FAC002` (Prof. Ada Lovelace) |
| **Faculty 003** | `faculty3@abc.edu` | `Password123!` | `FAC003` (Prof. Grace Hopper) |
| **Student 001** | `stu001@abc.edu` | `Password123!` | `STU001` (John Doe) |
| **Student 002** | `stu002@abc.edu` | `Password123!` | `STU002` (Jane Smith) |
| **Student 003** | `stu003@abc.edu` | `Password123!` | `STU003` (Bob Johnson) |
| **Student 004** | `stu004@abc.edu` | `Password123!` | `STU004` (Alice Williams) |
| **Student 005** | `stu005@abc.edu` | `Password123!` | `STU005` (Charlie Brown) |

*Note: In accordance with security specifications, no fake biometric embeddings are pre-seeded. Register your real face using the camera!*

---

## Real Biometric Face Recognition Workflow

1. **Camera Capture**: `FaceCameraModal` opens front camera with an oval alignment guide and real-time posture instructions.
2. **Quality & Lighting Validation**: Image luminance must be healthy (not pitch dark <20, not overexposed >245). Laplacian high-frequency gradient variance checks for blur.
3. **Single Face Verification**: YCbCr skin chrominance cluster segmentation and spatial peak analysis verify that **exactly one** person is in frame. Multiple faces or zero faces are automatically rejected.
4. **128-d Biometric Descriptor Extraction**: Multi-scale 4x4 spatial block LBP + 8-orientation HOG gradients produce a normalized 128-dimensional unit vector (`||v|| = 1.0`).
5. **Secure Storage**: Stored as serialized vector in `face_profiles`. Raw photos or embeddings are **never** returned to the frontend.
6. **Live Matching**: Dot-product cosine similarity compared against enrolled students. If similarity < `FACE_MATCH_THRESHOLD` (0.75), check-in is rejected.
7. **Authoritative Timestamping**: Server clock evaluates timestamp against session threshold:
   - Check-in before/at threshold -> **PRESENT** (Green)
   - Check-in after threshold -> **LATE** (Orange)
8. **Live 1-Second Polling**: Faculty screen polls `GET /api/attendance/sessions/{sessionId}/live` every 1000ms using TanStack Query, updating counts and student roster in real-time.

---

## Running the Application Locally

### 1. Spring Boot Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/smart-attendance-backend-1.0.0.jar
```
Backend will start on `http://localhost:8080`.
Verify health check:
`GET http://localhost:8080/api/health` -> `{"status": "UP"}`

### 2. React Native Expo Frontend
```bash
cd frontend
npm install
npm run web      # Run on Expo Web in browser
npm run android  # Run on Android device/emulator
```

---

## Supabase PostgreSQL Setup
To connect to your own Supabase project:
1. Open your Supabase project SQL Editor.
2. Run the script provided in `backend/src/main/resources/schema-supabase.sql`.
3. In `backend/.env` or Render environment variables, configure:
   ```env
   DATABASE_URL=jdbc:postgresql://<db-host>:5432/postgres
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=<your-supabase-db-password>
   SUPABASE_URL=https://<your-project>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   ```

---

## Production Deployment

### Backend to Render
1. Connect your Git repository to [Render](https://render.com).
2. Choose **Web Service** with **Java** runtime.
3. Build Command: `mvn clean package -DskipTests`
4. Start Command: `java -Dserver.port=$PORT -jar target/smart-attendance-backend-1.0.0.jar`
5. Health Check Path: `/api/health`
6. Add environment variables: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET`, `FRONTEND_URL`.

### Frontend to Vercel
1. In `frontend/.env.production` or Vercel dashboard:
   - `EXPO_PUBLIC_API_URL=https://<your-render-backend-url>/api`
   - `EXPO_PUBLIC_SUPABASE_URL=https://<your-supabase-project>.supabase.co`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>`
2. Deploy directly via Vercel with configuration from `frontend/vercel.json`.
