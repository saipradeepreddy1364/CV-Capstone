# Smart Face Attendance - React Native & Expo Frontend

Frontend application built with React Native, Expo, TypeScript, Expo Router, NativeWind (Tailwind CSS), TanStack Query, Expo Camera, Expo SecureStore, and Supabase client.

## Quick Start

```bash
npm install
npm run web      # Run on browser via Expo Web
npm run android  # Run on Android device
```

## Environment Variables (.env)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=http://localhost:8080/api
```

## Features
- **Role-Based Navigation**: Admin, Faculty, and Student route groups
- **1-Second Live Polling**: Real-time attendance live monitor with automatic unmount stop
- **Expo Camera Biometrics**: Interactive face oval guide and validation checklist
- **Student Attendance Calendar**: Status color indicators (Green/Red/Orange/Gray)
- **Token Security**: Tokens stored via `expo-secure-store` (with web localStorage fallback)
- **Vercel Ready**: Full export compatibility via `vercel.json`
