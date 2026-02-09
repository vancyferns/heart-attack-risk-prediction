# Eye Scan Pro - Quick Setup & Integration Guide

## Installation Steps

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will start at `http://localhost:5173` (or another port if 5173 is busy).

## File Structure Added

```
frontend/src/
├── components/
│   ├── Dashboard.jsx (NEW - Main dashboard container)
│   ├── Navigation.jsx (NEW - Sidebar navigation)
│   ├── PatientDetails.jsx (NEW - Patient form)
│   ├── EyeScanUpload.jsx (NEW - Eye scan upload)
│   ├── Results.jsx (NEW - Results display)
│   ├── LoginForm.jsx (existing)
│   ├── RegisterForm.jsx (existing)
│   └── AnimatedBackground.jsx (existing)
├── assets/
│   ├── Dashboard.css (NEW)
│   ├── Navigation.css (NEW)
│   ├── PatientDetails.css (NEW)
│   ├── EyeScanUpload.css (NEW)
│   ├── Results.css (NEW)
│   └── Forms.css (existing)
├── App.jsx (UPDATED - Added Dashboard import)
├── App.css (UPDATED - Layout support)
├── main.jsx (existing)
└── index.css (existing)
```

## Application Flow

### User Journey
```
1. User Opens App
   ↓
2. If Not Logged In → Show Login/Register
   ↓
3. If Logged In → Show Dashboard
   ├── Dashboard Home
   │   └── Click "Start Scan"
   │       ↓
   │   Patient Details Form
   │   ├── Enter Name, Age, Email, Contact, Address
   │   ├── Optional: Medical History, Medications
   │   └── Click "Proceed to Eye Scan"
   │       ↓
   │   Eye Scan Upload
   │   ├── Drag & Drop or Browse Image
   │   ├── System analyzes (2 sec mock)
   │   └── Click "Analyze"
   │       ↓
   │   Results Page
   │   ├── View Risk Level, Score, Confidence
   │   ├── Review Recommendations
   │   └── Download Report or Start New Scan
```

## Component Props

### Dashboard Component
```jsx
<Dashboard 
  user={userData}        // Object with {name, email, id}
  onLogout={handleLogout} // Function to handle logout
/>
```

### Navigation Component
```jsx
<Navigation 
  currentView="dashboard"           // Current view name
  onNavigate={handleNavigate}       // Function to change view
  user={userData}                  // User object
  onLogout={handleLogout}          // Logout function
/>
```

### PatientDetails Component
```jsx
<PatientDetails 
  onSubmit={handlePatientDataSubmit} // Called with form data
/>
```

### EyeScanUpload Component
```jsx
<EyeScanUpload 
  onSubmit={handleScanUpload}  // Called with analysis results
  patientData={patientData}    // Patient info from previous form
/>
```

### Results Component
```jsx
<Results 
  results={scanResults}    // {riskLevel, riskScore, confidence, ...}
  patientData={patientData} // Patient info
  onReset={handleReset}    // Reset to home
/>
```

## State Management (Dashboard.jsx)

```javascript
const [currentView, setCurrentView] = useState('dashboard');
const [patientData, setPatientData] = useState(null);
const [scanResults, setScanResults] = useState(null);
const [isLoading, setIsLoading] = useState(false);
```

### View Options
- `'dashboard'` - Home page
- `'patient-details'` - Patient form
- `'eye-scan'` - Upload interface
- `'results'` - Results display
- `'history'` - Patient history (planned)
- `'settings'` - Settings (planned)

## API Integration Points

### Mock Data Currently Used
The app uses mock data for testing. Replace these with real API calls:

#### 1. Eye Scan Analysis (EyeScanUpload.jsx)
```javascript
// Current: Mock analysis
setTimeout(() => {
  const mockResults = {
    riskLevel: 'High',
    riskScore: 78,
    confidence: 92,
    message: 'The eye scan indicates elevated risk indicators',
    recommendations: [...]
  };
  onSubmit(mockResults);
}, 2000);

// Replace with: Real API call
// const response = await axios.post('/api/scan/analyze', formData);
// onSubmit(response.data);
```

#### 2. Report Download (Results.jsx)
```javascript
// Current: Mock download
setTimeout(() => {
  const pdfContent = generatePDFContent();
  console.log('Downloading report:', pdfContent);
  setIsDownloading(false);
  alert('Report downloaded successfully!');
}, 1500);

// Replace with: Real PDF generation
// const response = await axios.post('/api/reports/generate', {patientData, results});
// Download file from response
```

## Styling Guidelines

### CSS Architecture
- **Modular CSS**: Each component has its own CSS file
- **Color variables**: Used in CSS, defined in component guides
- **Responsive grid**: Uses CSS Grid with auto-fit
- **Smooth animations**: 0.3s ease transitions

### Adding New Styles
1. Create new CSS file in `src/assets/`
2. Import in corresponding component
3. Use consistent naming: `component-name`, `component-name--modifier`
4. Follow color palette and spacing system

## Responsive Breakpoints

```css
/* Desktop (default) */
/* All features visible */

/* Tablet (max-width: 768px) */
@media (max-width: 768px) {
  /* Sidebar narrower, grids 2-column, stacked forms */
}

/* Mobile (max-width: 480px) */
@media (max-width: 480px) {
  /* Sidebar icons-only or hidden, 1-column grids */
}
```

## Performance Considerations

1. **Image Optimization**: Eye scan images compressed before upload
2. **Lazy Loading**: Components loaded on demand
3. **Memoization**: Use React.memo() for expensive components
4. **CSS Over JS**: Animations use CSS, not JavaScript
5. **Event Delegation**: Use event bubbling where appropriate

## Browser Compatibility

- Chrome: Latest
- Firefox: Latest
- Safari: Latest
- Edge: Latest
- Mobile Chrome & Safari: Latest

## Troubleshooting

### Dashboard Not Showing
- Verify authentication state is true
- Check localStorage has 'token' and 'user'
- Check browser console for errors

### Styles Not Applied
- Ensure CSS files are imported in component
- Check CSS class names match
- Clear browser cache (Ctrl+Shift+Delete)
- Verify no CSS conflicts

### Form Validation Not Working
- Check validation logic in component
- Ensure error state is being set
- Check error message rendering

### Navigation Not Switching Views
- Verify currentView state is updating
- Check click handlers are wired correctly
- Check renderContent() includes all views

## Development Mode Features

- Hot Module Replacement (HMR)
- Fast Refresh for quick updates
- Source maps for debugging
- Console warnings for React

## Production Build

```bash
npm run build
```

Creates optimized build in `dist/` directory:
- Minified JavaScript
- Optimized CSS
- Compressed images
- Reduced bundle size

## Environment Variables

Create `.env` file in frontend directory:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Eye Scan Pro
```

Access in components:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## Next Steps

1. ✅ Dashboard UI complete
2. ⬜ Connect to backend APIs
3. ⬜ Implement patient history feature
4. ⬜ Add analytics dashboard
5. ⬜ Generate real PDF reports
6. ⬜ Implement email notifications
7. ⬜ Add admin panel
8. ⬜ Setup authentication tokens refresh

## Support & Documentation

- **Dashboard Documentation**: See `DASHBOARD_DOCUMENTATION.md`
- **Component Guide**: See `COMPONENT_GUIDE.md`
- **State Diagram**: See project image
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev

## Common Tasks

### Add New Navigation Item
1. Update Navigation.jsx NavItem list
2. Add new view in Dashboard renderContent()
3. Create corresponding component
4. Update state handlers

### Change Color Theme
1. Update color values in CSS files
2. Update color palette in COMPONENT_GUIDE.md
3. Test contrast ratios (WCAG AA)

### Add New Form Field
1. Add to PatientDetails.jsx state
2. Add input element to form
3. Add validation logic
4. Add error message display

### Extend Results Display
1. Update mock results in EyeScanUpload.jsx
2. Add new result card or indicator
3. Add corresponding CSS styles
4. Update COMPONENT_GUIDE.md

---

**Ready to develop!** 🚀  
Start the dev server and begin building on this solid foundation.
