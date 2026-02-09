# 🚀 Heart Lens - Quick Start Guide

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation Steps

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
http://localhost:5174/
```

---

## 🎯 Application Features & Usage

### 1. Landing Page
**URL**: `/` (when not authenticated)

**Features**:
- Hero section with application overview
- 6-step process explanation
- Application flow visualization
- Key features highlight
- Statistics showcase
- Benefits section
- Call-to-action buttons

**Actions**:
- Click "Sign Up" or "Get Started Now" → Register
- Click "Sign In" → Login

---

### 2. User Authentication

#### Sign Up
**Location**: Landing Page → "Sign Up" button

**Form Fields**:
- Email Address (required, must be unique)
- Password (required, minimum 6 characters)
- Confirm Password (must match)

**Validation**:
- Email format validation
- Password strength checking
- Password match verification

**On Success**:
- Account created
- Auto-login (token stored)
- Redirect to Dashboard

---

#### Sign In
**Location**: Landing Page → "Sign In" button

**Form Fields**:
- Email Address (required)
- Password (required)

**Validation**:
- Email format
- Credentials verification

**On Success**:
- Token stored in localStorage
- User data persisted
- Redirect to Dashboard

**On Failure**:
- Error message displayed
- User stays on login form

---

### 3. Dashboard

**Location**: After successful authentication

**Components**:
- Navigation Sidebar (collapsible)
- Welcome Header
- Quick Action Cards
- How It Works Guide

**Navigation Options**:
- 🏠 Dashboard - Main dashboard
- 👤 Patient Details - Register new patient
- 📸 Eye Scan - Upload eye scan image
- 📊 Results - View analysis results
- 📋 History - View past scans
- ⚙️ Settings - App settings
- 🚪 Logout - Sign out

**Quick Actions**:
- [New Patient Scan] - Starts patient registration
- [View History] - Shows past scans
- [Analytics] - Shows statistics

---

### 4. Patient Registration

**Location**: Dashboard → "New Patient Scan" or Navigation → "Patient Details"

**Form Fields**:

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| Full Name | Text | Yes | Non-empty |
| Age | Number | Yes | 1-120 range |
| Email Address | Email | Yes | Valid format |
| Contact Number | Phone | Yes | 10 digits |
| Address | Textarea | Yes | Non-empty |
| Medical History | Textarea | No | Optional |
| Current Medications | Textarea | No | Optional |

**Validation Errors**:
- ⚠️ "Name is required"
- ⚠️ "Valid age is required"
- ⚠️ "Valid email is required"
- ⚠️ "Valid 10-digit contact number is required"
- ⚠️ "Address is required"

**On Success**:
- Patient data stored in component state
- Redirect to Eye Scan Upload
- Loading spinner during processing

---

### 5. Eye Scan Upload

**Location**: After Patient Registration

**Display**:
- Patient Information Card (summary of registered data)
- Upload Area (drag & drop or browse)

**Upload Methods**:

#### Drag & Drop
1. Drag image file over upload area
2. Area highlights on hover
3. Drop to upload

#### Browse Files
1. Click upload area or "Browse Files" button
2. Select image from file browser
3. Image validated immediately

**File Requirements**:
- **Formats**: JPG, PNG, GIF
- **Max Size**: 10MB
- **Resolution**: Minimum 512x512 pixels
- **Type**: Image file only

**Validation Messages**:
- ⚠️ "Invalid file format. Please upload JPG, PNG, or GIF."
- ⚠️ "File size exceeds 10MB. Please choose a smaller file."

**Image Preview**:
- Shows uploaded image thumbnail
- Option to change image
- Clear file selection

**Analysis**:
1. Click "Analyze Eye Scan →"
2. Loading spinner appears with "Analyzing..." message
3. Simulated 2-second processing
4. Results generated automatically

---

### 6. Results Display

**Location**: After Eye Scan Analysis

**Result Cards**:

#### Risk Level Card
- Shows: HIGH, MEDIUM, or LOW
- Color coded: Red (HIGH), Yellow (MEDIUM), Green (LOW)
- Warning icon

#### Risk Score Card
- Displays percentage (0-100%)
- Circular progress visualization
- Visual indicator of risk level

#### Confidence Level Card
- Shows AI model confidence (%)
- Indicates analysis reliability

**Patient Summary**:
- Name, Age, Email, Contact
- Address, Analysis Date

**Analysis Overview**:
- Descriptive message about risk
- Clinical findings summary

**Recommendations**:
- Bulleted list of medical recommendations
- Actionable next steps
- Doctor consultation suggestions

**Risk Indicators**:
- Eye Fundus Changes - % risk indicator
- Vessel Abnormalities - % risk indicator
- Microaneurysms - % risk indicator
- Retinal Changes - % risk indicator

**Actions**:

| Button | Function |
|--------|----------|
| 📥 Download Report | Generate & download PDF |
| 🔄 Start New Scan | Reset & return to dashboard |

---

### 7. Download Report

**Process**:
1. Click "📥 Download Report"
2. Loading spinner shows "Generating Report..."
3. Simulated 1.5-second processing
4. Success message: "Report downloaded successfully!"

**Report Contents** (Simulated):
- Header: "HEART ATTACK RISK PREDICTION REPORT"
- Generation timestamp
- Patient information
- Analysis results
- Risk assessment
- Medical recommendations

**Next Actions**:
- Can start new scan
- Can download again
- Can access from results page

---

### 8. Navigation & Logout

**Sidebar Features**:
- **Collapsible**: Click toggle button to expand/collapse
- **User Profile**: Shows current user avatar & name
- **Active Indicator**: Current page highlighted
- **Hover Effects**: Visual feedback on hover
- **Section Organization**: Grouped menu items
- **Responsive**: Adapts to screen size

**Logout**:
1. Click "🚪 Logout" in sidebar footer
2. Confirmation dialog appears
3. On confirm:
   - LocalStorage cleared (token, user)
   - Authentication state reset
   - Redirect to Landing Page

---

## 📱 Responsive Design

### Desktop (1024px+)
- Full sidebar visible
- All content displayed
- Optimal spacing

### Tablet (768px - 1023px)
- Sidebar adjustable
- Adjusted grid layouts
- Touch-friendly buttons

### Mobile (Below 768px)
- Collapsible sidebar
- Single column layouts
- Optimized spacing
- Touch gestures

### Small Mobile (Below 480px)
- Minimal sidebar
- Stacked elements
- Large touch targets

---

## 🎨 Themes & Colors

### Primary Colors
```
Gradient: #ff7b7b → #b33a3a (Reddish)
Primary Text: #2d3748 (Dark)
Secondary Text: #718096 (Gray)
Background: #f5f7fa (Light)
White: #ffffff
```

### Status Colors
```
Success (Low Risk): #28a745 (Green)
Warning (Medium Risk): #ffc107 (Yellow)
Danger (High Risk): #dc3545 (Red)
Info: #b33a3a (Reddish)
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate between fields |
| `Enter` | Submit form (when focused on submit button) |
| `Escape` | Close dialogs (when implemented) |

---

## 🔍 Form Validation Examples

### Patient Details Form
```
Input: "John"
Field: Full Name
Status: ✓ Valid (non-empty)

Input: "150"
Field: Age
Status: ✗ Invalid (exceeds 120)
Message: "Valid age is required"

Input: "user@email"
Field: Email
Status: ✗ Invalid (no TLD)
Message: "Valid email is required"

Input: "12345"
Field: Phone
Status: ✗ Invalid (not 10 digits)
Message: "Valid 10-digit contact number is required"
```

---

## 📊 Data Flow Example

### Complete User Journey
```
1. User lands on homepage
   ↓
2. Clicks "Sign Up"
   ↓
3. Fills: email, password, confirm
   ↓
4. Clicks "Register"
   ↓
5. Backend validates & creates account
   ↓
6. Returns: token, user { name, email }
   ↓
7. App stores in localStorage
   ↓
8. Redirects to Dashboard
   ↓
9. User clicks "New Patient Scan"
   ↓
10. Fills: name, age, email, phone, address, history
    ↓
11. Clicks "Proceed to Eye Scan"
    ↓
12. Component stores patientData
    ↓
13. Navigates to Eye Scan Upload
    ↓
14. User drags/selects eye scan image
    ↓
15. File validated (format, size, preview)
    ↓
16. User clicks "Analyze Eye Scan"
    ↓
17. Loading state shown for 2 seconds
    ↓
18. Mock results generated:
    {
      riskLevel: 'High',
      riskScore: 78,
      confidence: 92,
      message: '...',
      recommendations: [...]
    }
    ↓
19. Navigates to Results page
    ↓
20. Results displayed with all cards
    ↓
21. User can:
    - Download Report
    - Start New Scan
    - View from Sidebar
    - Logout
```

---

## 🐛 Troubleshooting

### Issue: Page doesn't load
**Solution**: 
- Check if dev server is running: `npm run dev`
- Clear browser cache
- Try different browser

### Issue: Form not validating
**Solution**:
- Check browser console for errors
- Ensure all required fields filled
- Verify input formats

### Issue: Image not uploading
**Solution**:
- Check file format (JPG, PNG, GIF only)
- Check file size (max 10MB)
- Ensure image is not corrupted
- Try browser's file manager

### Issue: Can't login
**Solution**:
- Verify email format is correct
- Check password (case-sensitive)
- Ensure backend is running
- Check network connection

---

## 🔐 Security Notes

- **Passwords**: Never shared over console/logs
- **Tokens**: Stored in localStorage (consider httpOnly cookies in production)
- **Sensitive Data**: Handle carefully when logging
- **CORS**: Configure backend for frontend origin
- **HTTPS**: Use in production
- **Input Validation**: Always validate on both client & server

---

## 📝 API Integration Points

When connecting to backend, replace mock responses with actual API calls:

```javascript
// Eye Scan Analysis - Current Mock
const mockResults = {
  riskLevel: 'High',
  riskScore: 78,
  confidence: 92,
  ...
};

// Replace with actual API call:
const response = await axios.post(
  'http://backend:5000/api/scan/analyze',
  formData,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const results = response.data;
```

---

## 📚 Component Testing Checklist

- [ ] Landing page loads without errors
- [ ] Navigation between pages works
- [ ] Form validation displays errors
- [ ] File upload accepts valid files
- [ ] File upload rejects invalid files
- [ ] Results display correctly
- [ ] Download button triggers download
- [ ] Logout clears session
- [ ] Mobile responsive works
- [ ] Back/forward browser buttons work

---

## 🎓 Learning Resources

### File Structure
```
frontend/
├── src/
│   ├── components/     (React components)
│   ├── assets/        (CSS files)
│   ├── App.jsx        (Main app component)
│   ├── App.css        (Global styles)
│   ├── index.css      (Global utilities)
│   └── main.jsx       (Entry point)
├── package.json       (Dependencies)
└── vite.config.js     (Build config)
```

### Key Concepts Used
- **Hooks**: useState, useEffect
- **State Management**: Local component state
- **Conditional Rendering**: ternary operators
- **Event Handling**: onClick, onChange, onSubmit
- **Form Validation**: Real-time feedback
- **CSS Grid/Flexbox**: Responsive layouts
- **localStorage**: Data persistence

---

## 🚀 Next Steps

1. **Backend Integration**
   - Connect authentication endpoints
   - Implement eye scan analysis API
   - Set up image processing

2. **Database**
   - Store patient records
   - Store scan history
   - Store analysis results

3. **Advanced Features**
   - Patient search & filtering
   - Scan history view
   - Analytics dashboard
   - Report customization

4. **Production Deployment**
   - Build optimization
   - Environment configuration
   - Error monitoring
   - Performance tracking

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify all dependencies installed
3. Check backend connection
4. Review component documentation
5. Check APPLICATION_FLOW.md for state flow

---

**Happy coding! 🎉**
