# 🌱 Farmer Registration & Verification Guide

## Overview
Your AgriTech platform now has a complete farmer registration and verification system!

## How It Works

### 1. **For Users Wanting to Become Farmers:**

#### Step 1: User Registration
- Users sign up normally through the frontend
- They get a regular user account initially

#### Step 2: Farmer Profile Creation
- **API Endpoint**: `POST /api/auth/farmer-profile`
- **Requires**: User to be logged in
- **Fields Required**:
  ```json
  {
    "farmName": "Farm Name",
    "location": {
      "city": "City Name",
      "state": "State Name",
      "country": "Nigeria"
    },
    "specializations": ["Crop Farming", "Organic Farming"],
    "farmSize": {
      "value": 5,
      "unit": "acres"
    },
    "farmingExperience": 10,
    "bankDetails": {
      "bankName": "Bank Name",
      "accountNumber": "1234567890",
      "accountName": "Farmer Name"
    }
  }
  ```

#### Step 3: Pending Verification
- Farmer profile created with `isVerified: false`
- User role automatically upgraded to 'farmer'
- Farmer appears in admin dashboard for verification

### 2. **For Admin (You):**

#### View Pending Farmers
- Log in as admin (`eclefzy@gmail.com`)
- Go to Admin Dashboard
- Scroll to "Registered Farmers" section
- Look for farmers with **"⏳ Pending"** badge

#### Verify Farmers
- Click **"✅ Verify Farmer"** button
- Farmer status changes to verified
- Farmer can now:
  - Add products to marketplace
  - Receive orders
  - Appear in public farmers list

#### Unverify Farmers (if needed)
- Click **"❌ Unverify"** button for verified farmers
- Removes verification status

## Current Status

### ✅ **What's Working:**
- Backend farmer registration endpoint: `/api/auth/farmer-profile`
- Admin farmer verification endpoint: `/api/admin/farmers/:id/verify`
- Admin dashboard shows all farmers with verification status
- Frontend displays farmer verification controls

### 📋 **What You Need to Do:**

1. **Test the System:**
   - Create a test user account
   - Test farmer profile creation via API
   - Verify the farmer appears in admin dashboard

2. **Frontend Farmer Registration:**
   - Currently shows "Coming Soon" message
   - You can implement a proper farmer registration form later

3. **Check for Existing Farmers:**
   - Log into your admin dashboard
   - Check if any farmers are already pending verification

## API Endpoints Summary

| Endpoint | Method | Purpose | Access |
|----------|--------|---------|---------|
| `/api/auth/farmer-profile` | POST | Create farmer profile | Authenticated users |
| `/api/admin/farmers` | GET | List all farmers | Admin only |
| `/api/admin/farmers/:id/verify` | PUT | Verify/unverify farmer | Admin only |

## Testing the Farmer

If the farmer you mentioned signed up, they likely:
1. ✅ Created a user account
2. ❌ **Missing**: Created a farmer profile

**To find them:**
1. Check your admin dashboard for all users
2. Look for farmers with `isVerified: false`
3. If no farmers appear, the user hasn't completed farmer profile creation

## Next Steps

1. **Login as admin** and check the farmers list
2. **Look for pending verifications**
3. **Verify any legitimate farmers**
4. **Guide users** to contact you for farmer registration until frontend form is ready

The system is now ready to handle farmer verifications! 🎉
