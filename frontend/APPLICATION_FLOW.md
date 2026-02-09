# Application State Flow & User Journey

## 🔄 Complete Application Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    APPLICATION ENTRY POINT                          │
│                         (App.jsx)                                   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
        ┌─────────────────────┐ ┌──────────────────────┐
        │ Check LocalStorage  │ │ No Token Found?      │
        │ for Auth Token      │ │ Show Landing Page    │
        └──────────┬──────────┘ └──────────┬───────────┘
                   │                       │
         ┌─────────┴──────────┐            │
         │ Token Exists?      │            │
         └─────────┬──────────┘            │
                   │                       │
         ┌─────────┴──────────┐            │
         │ Show Dashboard     │            │
         └─────────┬──────────┘            │
                   │                       │
                   │         ┌─────────────┘
                   │         │
                   │         ▼
        ┌──────────┴──────────────────────────┐
        │       LANDING PAGE (currentView: 'landing')      │
        │  ┌──────────────────────────────────┐           │
        │  │ Hero Section with Features        │           │
        │  │ Application Flow Diagram          │           │
        │  │ Statistics & Benefits             │           │
        │  │ Sign In Button │ Sign Up Button   │           │
        │  └──┬─────────────────────────────┬─┘           │
        └─────┼─────────────────────────────┼──────────────┘
              │                             │
              ▼                             ▼
    ┌─────────────────────┐     ┌─────────────────────┐
    │ LOGIN PAGE          │     │ REGISTER PAGE       │
    │ (currentView:       │     │ (currentView:       │
    │  'login')           │     │  'register')        │
    │                     │     │                     │
    │ Email Input         │     │ Name Input          │
    │ Password Input      │     │ Email Input         │
    │ Sign In Button      │     │ Password Input      │
    │ Switch to Register  │     │ Confirm Password    │
    │ Link                │     │ Register Button     │
    │                     │     │ Switch to Login     │
    └──────────┬──────────┘     │ Link                │
               │                └────────┬────────────┘
               │                         │
               │    ┌────────────────────┘
               │    │
               ▼    ▼
        ┌──────────────────────────────────┐
        │ API: POST /auth/login or /auth/  │
        │       register                   │
        │ Returns: token, user data        │
        └──────────┬───────────────────────┘
                   │
          ┌────────┴────────┐
          │ Success?        │
          └────────┬────────┘
                   │
        ┌──────────┴──────────┐
        │ Store in localStorage│
        │ Set isAuthenticated  │
        │ currentView='dash'   │
        └──────────┬──────────┘
                   │
                   ▼
    ┌───────────────────────────────────────────────┐
    │         DASHBOARD (currentView: 'dashboard')   │
    │                                               │
    │  ┌─────────────────────────────────────────┐ │
    │  │ Navigation Sidebar (collapsible)        │ │
    │  │ ├─ Dashboard (active)                  │ │
    │  │ ├─ Patient Details                     │ │
    │  │ ├─ Eye Scan                            │ │
    │  │ ├─ Results                             │ │
    │  │ ├─ History                             │ │
    │  │ ├─ Settings                            │ │
    │  │ └─ Logout                              │ │
    │  └──────┬───────────────────────────────┬─┘ │
    │         │                               │    │
    │  ┌──────▼───────────────────────────────▼──┐ │
    │  │ Welcome, [User Name]!                  │ │
    │  │                                         │ │
    │  │ Quick Actions:                          │ │
    │  │ [New Patient Scan] [View History]       │ │
    │  │                                         │ │
    │  │ How It Works (4 steps):                 │ │
    │  │ 1. Patient Registration                │ │
    │  │ 2. Eye Scan Upload                     │ │
    │  │ 3. Analysis                            │ │
    │  │ 4. Download Report                     │ │
    │  └──────┬──────────────────────────────────┘ │
    └─────────┼──────────────────────────────────┘ │
              │                                   │
              │ (clicking "New Patient Scan")   │
              ▼                                   ▼
    ┌─────────────────────────────────┐  Can navigate via sidebar
    │ PATIENT DETAILS FORM            │  to any section
    │ (currentView: 'patient-details')│
    │                                 │
    │ Full Name (required)            │
    │ Age (1-120)                    │
    │ Email                          │
    │ Contact Number (10-digit)      │
    │ Address                        │
    │ Medical History (optional)     │
    │ Medications (optional)         │
    │                                 │
    │ [Validate] ──► Errors?         │
    │ ├─ Yes ──► Show error messages │
    │ └─ No ──► Store patientData    │
    │           Navigate to Eye Scan │
    └──────────────┬──────────────────┘
                   │
                   ▼
    ┌───────────────────────────────────────────┐
    │ EYE SCAN UPLOAD (currentView: 'eye-scan') │
    │                                           │
    │ Patient Info Display:                     │
    │ Name: [patientData.name]                  │
    │ Age: [patientData.age]                    │
    │ Email: [patientData.email]                │
    │ Contact: [patientData.contactNumber]      │
    │                                           │
    │ Upload Area (Drag & Drop):               │
    │ ┌─────────────────────────────┐          │
    │ │ 📸 Upload Eye Scan Image    │          │
    │ │ Drag & drop or Browse Files │          │
    │ │                             │          │
    │ │ Formats: JPG, PNG, GIF      │          │
    │ │ Max Size: 10MB              │          │
    │ └─────────────────────────────┘          │
    │                                           │
    │ File Validation:                          │
    │ ├─ Check format                          │
    │ ├─ Check size                            │
    │ └─ Show preview if valid                 │
    │                                           │
    │ [Analyze Eye Scan →]                     │
    │ ├─ Show loading spinner                  │
    │ ├─ Simulate API call (2s)                │
    │ ├─ Generate mock results                 │
    │ └─ Store in scanResults                  │
    └──────────────┬───────────────────────────┘
                   │
                   ▼
    ┌────────────────────────────────────────────┐
    │ RESULTS (currentView: 'results')           │
    │                                            │
    │ ┌────────────────────────────────────────┐ │
    │ │ Risk Level Card    Risk Score Card   │ │
    │ │ ┌──────────┐    ┌───────────────────┐│ │
    │ │ │  HIGH    │    │  78%              ││ │
    │ │ │  ⚠️       │    │  ◯ Progress Ring  ││ │
    │ │ └──────────┘    └───────────────────┘│ │
    │ │                                        │ │
    │ │ Confidence Level Card                  │ │
    │ │ ┌────────────────────────────────────┐ │
    │ │ │ 92% AI Model Confidence            │ │
    │ │ └────────────────────────────────────┘ │
    │ └────────────────────────────────────────┘ │
    │                                            │
    │ Patient Summary:                           │
    │ ├─ Name: [patientData.name]               │
    │ ├─ Age: [patientData.age]                 │
    │ ├─ Email: [patientData.email]             │
    │ ├─ Contact: [patientData.contactNumber]   │
    │ └─ Analysis Date: [Current Date]          │
    │                                            │
    │ Analysis Overview:                        │
    │ "The eye scan indicates elevated risk..." │
    │                                            │
    │ Recommendations:                          │
    │ ✓ Immediate consultation recommended    │
    │ ✓ Schedule comprehensive assessment     │
    │ ✓ Monitor blood pressure regularly      │
    │                                            │
    │ Risk Indicators:                          │
    │ ├─ Eye Fundus Changes: 75% ████████      │
    │ ├─ Vessel Abnormalities: 62% ██████     │
    │ ├─ Microaneurysms: 45% █████            │
    │ └─ Retinal Changes: 58% ██████          │
    │                                            │
    │ [📥 Download Report] [🔄 Start New Scan]  │
    │                                            │
    │ Download Report:                          │
    │ ├─ Generate PDF                          │
    │ ├─ Show loading                          │
    │ └─ Download file                         │
    │                                            │
    │ Start New Scan:                           │
    │ └─ Reset state & navigate to dashboard   │
    └────────────────────────────────────────────┘
              │                      │
              │                      │
              ▼                      ▼
    ┌──────────────────┐  ┌──────────────────────┐
    │ PDF Downloaded   │  │ Return to Dashboard  │
    │ (File saved)     │  │ Clear patientData    │
    │                  │  │ Clear scanResults    │
    │ User can view    │  │ Ready for new scan   │
    │ or print report  │  │                      │
    └──────────────────┘  └──────────────────────┘
```

## 🔐 Authentication State Flow

```
┌────────────────────────────────────────────────────┐
│ useEffect on App Mount                             │
│                                                    │
│ Check localStorage for 'token' & 'user'           │
└────────────────────────────────────────────────────┘
         │
         ├─ Both found
         │  ├─ setIsAuthenticated(true)
         │  ├─ setUser(userData)
         │  ├─ setCurrentView('dashboard')
         │  └─ User sees Dashboard
         │
         └─ Not found
            ├─ setIsAuthenticated(false)
            ├─ setUser(null)
            ├─ setCurrentView('landing')
            └─ User sees Landing Page
```

## 🔄 Navigation State Transitions

```
Landing Page ──Sign In──► Login Form
                └─────────────┬────────────────┐
                              │                │
                    Credentials OK    Credentials Error
                              │                │
                              ▼                ▼
                         Store Token    Show Error Message
                              │                │
                              ▼                │
                         Set Auth=true    Stay on Login
                              │
                              ▼
                         Go to Dashboard


Landing Page ──Sign Up──► Register Form
                └─────────────┬────────────────┐
                              │                │
                    Registration OK  Registration Error
                              │                │
                              ▼                ▼
                         Store Token    Show Error Message
                              │                │
                              ▼                │
                         Set Auth=true    Stay on Register
                              │
                              ▼
                         Go to Dashboard


Dashboard (any page) ──Logout──► Clear localStorage
                                     │
                                     ▼
                              Set Auth=false
                                     │
                                     ▼
                            Go to Landing Page
```

## 📊 Data Flow Through Components

```
App.jsx (Global State)
│
├─ currentView: 'landing'|'login'|'register'|'dashboard'
├─ isAuthenticated: boolean
├─ user: { name, email, ... }
│
└─ Passes to Components:
   │
   ├─ LandingPage
   │  ├─ onSignIn={() => setCurrentView('login')}
   │  └─ onSignUp={() => setCurrentView('register')}
   │
   ├─ Dashboard
   │  ├─ user (display in header)
   │  ├─ onLogout (clear auth)
   │  └─ LocalState:
   │     ├─ patientData
   │     ├─ scanResults
   │     └─ currentView (within dashboard)
   │
   ├─ Navigation
   │  ├─ currentView (highlight active)
   │  ├─ user (show avatar)
   │  ├─ onNavigate (switch views)
   │  └─ onLogout (logout)
   │
   ├─ PatientDetails
   │  ├─ onSubmit(patientData)
   │  │  └─ Dashboard stores & navigates to Eye Scan
   │  └─ Form validation & error states
   │
   ├─ EyeScanUpload
   │  ├─ patientData (display info)
   │  ├─ onSubmit(scanResults)
   │  │  └─ Dashboard stores & navigates to Results
   │  └─ File validation & preview
   │
   └─ Results
      ├─ results (display risk data)
      ├─ patientData (display patient info)
      ├─ onReset (return to dashboard)
      └─ PDF download logic
```

## ⚙️ Component Lifecycle

```
App Mount
├─ useEffect checks authentication
│  ├─ If authenticated: navigate to Dashboard
│  └─ If not: show Landing Page
│
Landing Page Mount
├─ Render hero section
├─ Render feature cards
└─ Listen for Sign In/Up clicks

Login Form Mount
├─ Render form fields
├─ Setup form state
└─ Handle submit:
   ├─ Validate inputs
   ├─ Call API /auth/login
   ├─ Store token & user
   └─ Call onLoginSuccess

Dashboard Mount
├─ Render Navigation sidebar
├─ Render home view
└─ Show Quick Action cards:
   ├─ New Patient Scan → navigate to PatientDetails
   └─ View History → navigate to History

PatientDetails Mount
├─ Initialize form state (all fields empty)
├─ Render form with validation
└─ Handle submit:
   ├─ Validate all fields
   ├─ If error: show messages
   └─ If success: store & navigate to Eye Scan

EyeScanUpload Mount
├─ Display patient info
├─ Setup file upload
└─ Handle file selection:
   ├─ Validate format & size
   ├─ Show preview if valid
   └─ Enable submit button

Results Mount
├─ Display all result cards
├─ Display patient summary
├─ Show recommendations
└─ Provide actions:
   ├─ Download Report (generate & send)
   └─ Start New Scan (reset & go to dashboard)
```

## 🎯 User Journey Summary

```
1. User visits app
   ↓
2. Sees Landing Page with features & benefits
   ↓
3. Clicks "Sign Up" or navigates via buttons
   ↓
4. Fills registration form or login form
   ↓
5. Credentials validated by backend
   ↓
6. Token stored in localStorage
   ↓
7. Redirected to Dashboard
   ↓
8. Clicks "Start New Scan"
   ↓
9. Fills Patient Details form
   ↓
10. Proceeds to Eye Scan Upload
    ↓
11. Uploads/drags eye scan image
    ↓
12. Image validated and preview shown
    ↓
13. Clicks "Analyze Eye Scan"
    ↓
14. Backend processes analysis (simulated 2s)
    ↓
15. Results displayed with risk level & recommendations
    ↓
16. Can download report or start new scan
    ↓
17. Option to logout from any screen via sidebar
```

## 🔄 Local State Management in Dashboard

```
Dashboard Component
├─ currentView: 'dashboard'|'patient-details'|'eye-scan'|'results'
│  └─ Determines which content to display
│
├─ patientData: { name, age, email, contactNumber, address, ... }
│  └─ Persists through patient registration form
│
├─ scanResults: { riskLevel, riskScore, confidence, message, ... }
│  └─ Received from EyeScanUpload
│
└─ isLoading: boolean
   └─ Shows during analysis (simulated)
```

---

**This document describes the complete state and navigation flow of the Heart Lens application**
