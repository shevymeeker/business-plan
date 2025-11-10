# Business Plan Builder

A professional, offline-first business plan builder designed specifically for general contractors. Create polished, investor-ready business plans with consistent formatting across all devices.

## Features

- **Foolproof Guided Interface**: Step-by-step wizard that prevents formatting errors
- **Offline-First**: Works completely offline after first load - no internet required
- **Auto-Save**: Never lose your work - saves automatically as you type
- **Auto-Calculations**: Financial projections, ROI, and profit calculations done automatically
- **Cross-Platform**: Works on Apple devices, Android, Windows, and Linux
- **Professional PDF Output**: Print-ready business plans with locked formatting
- **Data Portability**: Export/import your data to move between devices

## Getting Started

### Quick Access (Recommended)

**🌐 Use the live version:** [https://shevymeeker.github.io/business-plan/](https://shevymeeker.github.io/business-plan/)

- Works immediately - no installation needed
- Full offline support after first visit
- Can be installed as a desktop/mobile app
- Perfect for contractors who want instant access

### Installation

1. **Option A: GitHub Pages** (Recommended - Already deployed!)
   - Visit the live version above
   - Click "Install" when prompted to add to your device
   - Use completely offline after first visit!
   - See [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md) for deployment instructions

2. **Option B: Local Web Server** (For development)
   ```bash
   # Using Python (if you have it installed)
   python -m http.server 8000

   # Or using Node.js http-server (npm install -g http-server)
   http-server -p 8000
   ```
   Then open http://localhost:8000 in your browser

3. **Option C: Direct File Access**
   - Simply open `index.html` in your web browser
   - Note: Service worker may not work with file:// protocol

### First Time Setup

1. Open the application in your browser
2. The wizard will guide you through 7 steps:
   - **Cover Page**: Basic project information
   - **Objectives**: Primary goals and financial targets
   - **Goals**: Short, medium, and long-term milestones
   - **Solution**: Development strategy and phases
   - **Project Outline**: Property details
   - **Budget**: Financial projections with auto-calculations
   - **Review**: Preview and print your business plan

3. Fill in each section - your data is automatically saved

## How to Use

### Creating a Business Plan

1. **Navigate Between Steps**: Use "Next" and "Previous" buttons or click on the progress bar
2. **Enter Your Information**: All fields are optional, but more detail = better plan
3. **Auto-Save**: Your work is automatically saved every 2 seconds
4. **Add Phases**: Click "+ Add Phase" to add multiple development phases
5. **Watch Calculations Update**: Budget numbers calculate automatically as you type

### Tips for Each Section

#### Goals (Step 3)
- Enter each goal on a new line
- They will automatically appear as bullet points in the final output

#### Phases (Step 4)
- Add as many phases as needed
- Include timeline and lot count for each phase
- Remove phases you don't need

#### Budget (Step 6)
- All financial calculations are automatic
- Watch the purple summary boxes update in real-time
- Adjust numbers until your projections look right

### Printing Your Business Plan

1. Complete all steps
2. Click "Preview" button in the header (or go to Step 7)
3. Click "Print Business Plan"
4. In the print dialog:
   - **To Save as PDF**: Choose "Save as PDF" as destination
   - **To Print**: Choose your printer

### Moving Between Devices

#### Export Data (on current device)
1. Click "Export Data" button in the header
2. Save the JSON file somewhere safe (email it to yourself, save to cloud storage, etc.)

#### Import Data (on new device)
1. Open the app on your new device
2. Click "Import Data" button
3. Select the JSON file you exported
4. All your data will be restored!

## Offline Usage

After loading the app once:
- The app will work completely offline
- Your data is stored in your browser's local storage
- No internet connection needed to create or edit plans
- Data persists even if you close the browser

## Browser Compatibility

Works on all modern browsers:
- Chrome / Edge (recommended)
- Safari (iOS and macOS)
- Firefox
- Samsung Internet
- Any mobile browser

## Data Privacy

- **100% Private**: All data stays on your device
- **No Cloud Storage**: Nothing is sent to any server
- **No Tracking**: No analytics or data collection
- **Local Only**: Data is stored in your browser's local storage

## Troubleshooting

### Data Not Saving
- Check that your browser allows local storage
- Make sure you're not in private/incognito mode

### Can't Print/Preview
- Ensure pop-ups are not blocked
- Try a different browser

### Lost Data
- Export your data regularly as backup
- Check if you're using the same browser/device

### Offline Not Working
- Make sure you loaded the app at least once with internet
- Try a different browser
- Use a local web server instead of file:// protocol

## Technical Details

### Built With
- Pure HTML, CSS, and JavaScript (no frameworks needed)
- Progressive Web App (PWA) technology
- Local Storage API for data persistence
- Service Worker for offline capability

### File Structure
```
business-plan/
├── index.html          # Main application
├── styles.css          # Editor interface styles
├── print.css           # Professional print output styles
├── app.js              # Application logic
├── manifest.json       # PWA configuration
├── service-worker.js   # Offline functionality
└── README.md           # This file
```

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Ensure you're using a modern, updated browser
3. Try exporting your data and reimporting in a fresh browser session

## License

This is a custom-built application. All rights reserved.

---

Built for contractors who need professional business plans without the hassle of formatting.
