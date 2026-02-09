# Eye Scan Pro - Visual Architecture & Flowchart

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    EYE SCAN PRO                         │
│              Heart Attack Risk Prediction               │
│                   React Dashboard                       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │      Authentication Layer            │
        │  (Login/Register Forms)              │
        │  ├─ Email Verification               │
        │  ├─ Password Management              │
        │  └─ Token Storage (localStorage)     │
        └──────────────┬───────────────────────┘
                       │
                  [Authenticated]
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │    Dashboard Container               │
        │  ┌────────────────────────────────┐  │
        │  │  Navigation Sidebar (Fixed)    │  │
        │  │  ├─ Logo & User Profile        │  │
        │  │  ├─ Navigation Menu (Sections) │  │
        │  │  │  ├─ Dashboard               │  │
        │  │  │  ├─ Patient Details         │  │
        │  │  │  ├─ Eye Scan                │  │
        │  │  │  ├─ Results                 │  │
        │  │  │  ├─ History                 │  │
        │  │  │  └─ Settings                │  │
        │  │  └─ Logout Button              │  │
        │  └────────────────────────────────┘  │
        │                                      │
        │  ┌────────────────────────────────┐  │
        │  │   Main Content Area            │  │
        │  │   (View Router)                │  │
        │  └────────────────────────────────┘  │
        └──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┬─────────────┬──────────────┐
         │             │             │             │              │
         ▼             ▼             ▼             ▼              ▼
    ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │Dashboard│ │ Patient  │ │Eye Scan  │ │ Results  │ │ History  │
    │Home     │ │ Details  │ │ Upload   │ │ Display  │ │ & Stats  │
    └─────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

## User Journey Flowchart

```
START
  │
  ├─ User Registers ──┐
  │                   │
  └─ User Logs In ◄───┘
        │
        ▼
    [Dashboard Home]
        │
        ├─ View Quick Actions ──┐
        │                       │
        ├─ View How It Works ───┤
        │                       │
        └─ Click "Start Scan" ◄─┘
               │
               ▼
        [Patient Details Form]
          ├─ Enter Name
          ├─ Enter Age
          ├─ Enter Email
          ├─ Enter Contact
          ├─ Enter Address
          ├─ Optional: Medical History
          ├─ Optional: Medications
          └─ Click "Proceed"
               │
               ▼
         [Eye Scan Upload]
          ├─ Select Image
          │  (Drag & Drop OR Browse)
          ├─ Validate:
          │  ├─ Format (JPG, PNG, GIF)
          │  ├─ Size (< 10MB)
          │  └─ Show Preview
          ├─ Review Patient Summary
          └─ Click "Analyze"
               │
               ▼
         [Loading State]
          ├─ Show Spinner
          ├─ Simulate Analysis (2s)
          └─ Generate Mock Results
               │
               ▼
         [Results Display]
          ├─ Show Risk Level
          │  ├─ HIGH (Red)
          │  ├─ MEDIUM (Yellow)
          │  └─ LOW (Green)
          ├─ Show Risk Score (%)
          ├─ Show Confidence (%)
          ├─ Show Patient Summary
          ├─ Show Analysis Message
          ├─ Show Recommendations
          │  └─ Multiple actionable items
          ├─ Show Risk Indicators
          │  ├─ Eye Fundus Changes
          │  ├─ Vessel Abnormalities
          │  ├─ Microaneurysms
          │  └─ Retinal Changes
          └─ Action Options:
             ├─ Download Report ──┐
             │                    │
             └─ Start New Scan ◄──┘
                    │
                    ▼
                 [Dashboard Home]
                    │
                    └──► View History / Settings
                         │
                         ▼
                      [History View]
                      (Planned Feature)
```

## Component Dependency Tree

```
App.jsx
  │
  ├── LoginForm
  │    └── AnimatedBackground
  │
  ├── RegisterForm
  │    └── AnimatedBackground
  │
  └── Dashboard ◄─── Main Container
       │
       ├── Navigation
       │    ├── User Profile Section
       │    ├── Navigation Menu Items
       │    └── Logout Button
       │
       ├── Dashboard Content (Router)
       │    │
       │    ├── HomeView
       │    │    ├── Welcome Header
       │    │    ├── Quick Action Cards
       │    │    └── How It Works Steps
       │    │
       │    ├── PatientDetails
       │    │    ├── Form Header
       │    │    ├── Patient Form
       │    │    │    ├── Basic Information
       │    │    │    └── Medical Information
       │    │    └── Submit Button
       │    │
       │    ├── EyeScanUpload
       │    │    ├── Scan Header
       │    │    ├── Patient Summary Card
       │    │    ├── Upload Area
       │    │    │    ├── Upload Placeholder
       │    │    │    └── Image Preview
       │    │    ├── Upload Requirements
       │    │    └── Analyze Button
       │    │
       │    └── Results
       │         ├── Results Header
       │         ├── Results Cards Grid
       │         │    ├── Risk Level Card
       │         │    ├── Risk Score Card
       │         │    └── Confidence Card
       │         ├── Patient Summary
       │         ├── Analysis Message
       │         ├── Recommendations Section
       │         ├── Risk Indicators
       │         └── Action Buttons
       │
       └── Responsive Sidebar (Mobile)
            └── Collapsible Menu
```

## State Flow Diagram

```
App State
  ├── isLoginView: boolean
  ├── isAuthenticated: boolean
  ├── user: {name, email, id, ...}
  │
  └── Dashboard State
      ├── currentView: 'dashboard' | 'patient-details' | 'eye-scan' | 'results'
      ├── patientData: {
      │    name, age, email, contact, address, medicalHistory, medications
      │  }
      ├── scanResults: {
      │    riskLevel, riskScore, confidence, message, recommendations
      │  }
      └── isLoading: boolean

          Navigation State
          ├── currentView: string (synced with Dashboard)
          └── isOpen: boolean (sidebar collapse state)

          PatientDetails State
          ├── formData: {all form fields}
          ├── errors: {field: error_message}
          └── isSubmitting: boolean

          EyeScanUpload State
          ├── file: File | null
          ├── preview: string (data URL)
          ├── error: string
          ├── dragActive: boolean
          └── isAnalyzing: boolean

          Results State
          ├── isDownloading: boolean
          └── (receives props: results, patientData)
```

## Data Flow Between Components

```
App Component
  │
  ├─► Pass: user, onLogout
  │
  └─► Dashboard Component
       │
       ├─► Pass: user, onLogout
       │
       ├─► Navigation Component
       │    │
       │    └─ Emit: handleNavigate(view)
       │
       └─► Dashboard Content Area
            │
            ├─► PatientDetails Component
            │    │
            │    └─ Emit: handlePatientDataSubmit(data)
            │         │
            │         ▼
            │    Set: patientData State
            │    Set: currentView = 'eye-scan'
            │
            ├─► EyeScanUpload Component
            │    │
            │    ├─ Pass: patientData (props)
            │    │
            │    └─ Emit: handleScanUpload(results)
            │         │
            │         ▼
            │    Set: scanResults State
            │    Set: currentView = 'results'
            │
            └─► Results Component
                 │
                 ├─ Pass: results, patientData (props)
                 │
                 └─ Emit: handleReset()
                      │
                      ▼
                 Set: currentView = 'dashboard'
                 Clear: patientData, scanResults
```

## Form Validation Flow

```
User Input
  │
  ├─ On Change
  │   ├─ Update State
  │   └─ Clear Error (if exists)
  │
  └─ On Submit
      │
      ├─ Validate All Fields
      │   ├─ Name: Required
      │   ├─ Age: 1-120, Number
      │   ├─ Email: Valid Format
      │   ├─ Contact: 10 Digits
      │   ├─ Address: Required
      │   └─ Store Errors Object
      │
      ├─ If Errors
      │   └─ Display Error Messages
      │
      └─ If Valid
          ├─ Set isSubmitting = true
          ├─ Call onSubmit() with Data
          ├─ Set isSubmitting = false
          └─ Navigate to Next Step
```

## API Integration Points (Future)

```
Backend API (Flask/Django)
        │
        ├─ POST /api/auth/login
        │  Request: {email, password}
        │  Response: {token, user}
        │
        ├─ POST /api/auth/register
        │  Request: {name, email, password}
        │  Response: {token, user}
        │
        ├─ POST /api/patient/create
        │  Request: {patientData}
        │  Response: {patientId, ...}
        │
        ├─ POST /api/scan/upload (Multipart)
        │  Request: {file, patientId}
        │  Response: {scanId, previewUrl}
        │
        ├─ POST /api/scan/analyze
        │  Request: {scanId, patientId}
        │  Response: {riskLevel, riskScore, ...}
        │
        ├─ GET /api/patient/history
        │  Request: {userId}
        │  Response: [{scan1}, {scan2}, ...]
        │
        └─ POST /api/report/generate
           Request: {patientId, scanId}
           Response: {pdfUrl}
```

## Responsive Layout Breakpoints

```
Desktop (1200px+)
┌──────────────────────────────────────┐
│ Sidebar (280px) │ Content Area       │
│                 │ Padding: 20px      │
│  Navigation     │ Grid: 3+ columns   │
│  (Full)         │                    │
└──────────────────────────────────────┘

Tablet (768px - 1199px)
┌──────────────────────────────┐
│ Sidebar (240px) │ Content    │
│  Navigation     │ Padding:15 │
│  (Compact)      │ Grid: 2col │
└──────────────────────────────┘

Mobile (< 768px)
┌──────────────────────────────┐
│ Content (Full Width)         │
│ Padding: 10px                │
│ Grid: 1 column               │
│ Sidebar: Icons Only / Hidden │
└──────────────────────────────┘
```

## Feature Roadmap

```
v1.0 (Current) ✅
├─ Authentication (Login/Register)
├─ Dashboard UI
├─ Patient Details Form
├─ Eye Scan Upload Interface
├─ Results Display
├─ Navigation System
└─ Responsive Design

v2.0 (Planned)
├─ Patient History
├─ Search & Filter Patients
├─ Analytics Dashboard
├─ Real API Integration
├─ PDF Report Generation
└─ Email Notifications

v3.0 (Future)
├─ Admin Panel
├─ User Management
├─ Advanced Analytics
├─ Multi-language Support
├─ Dark Mode Theme
└─ Offline Support
```

## Performance Optimization Strategy

```
Loading
  ├─ Lazy load components
  ├─ Code splitting per route
  └─ Minimize initial bundle

Runtime
  ├─ Memoize components (React.memo)
  ├─ Use useCallback for functions
  ├─ Optimize re-renders
  └─ CSS animations (GPU accelerated)

Images
  ├─ Compress uploads
  ├─ Lazy load previews
  └─ Responsive images

Caching
  ├─ Cache API responses
  ├─ LocalStorage for user data
  └─ IndexedDB for large datasets
```

---

**Visual Diagrams Version:** 1.0  
**Last Updated:** February 2026  
**Component Count:** 6 new + 2 existing = 8 total
