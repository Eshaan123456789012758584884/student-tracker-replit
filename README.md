# Academic Track - Student Attendance & Marks Tracker

**Ready-to-run on Replit with MongoDB Atlas**

## Quick Start (3 Steps)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up and create a **Free Shared Cluster**
3. Create a database user (username: `admin`, password: anything)
4. Allow network access from anywhere (0.0.0.0/0)
5. Copy your connection string from **Connect → Drivers**

### Step 2: Import to Replit
1. Click this button to import:
   [![Run on Replit](https://replit.com/badge/github/Eshaan123456789012758584884/student-tracker-replit)](https://replit.com/new/github/Eshaan123456789012758584884/student-tracker-replit)

2. Or go to https://replit.com and click **Create** → **Import from GitHub**
3. Paste: `https://github.com/Eshaan123456789012758584884/student-tracker-replit`

### Step 3: Set MongoDB Connection
1. Click the **Secrets** (🔒) icon in Replit sidebar
2. Add a new secret:
   - Key: `MONGODB_URI`
   - Value: Your MongoDB connection string from Step 1
3. Click **Run** button

**Done! Dashboard opens at the generated Replit URL**

## Features
- ✅ Add/delete students
- ✅ Track attendance with percentage
- ✅ Record marks and calculate grades
- ✅ Live statistics dashboard
- ✅ Professional UI matching Academic Track reference
- ✅ Mobile responsive
- ✅ No local setup needed

## MongoDB Connection String Format
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Replace `username` and `password` with your Atlas credentials.
