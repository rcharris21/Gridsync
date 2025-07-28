# GridSync - Protection Coordination Studies

GridSync is a web-based MVP for utility engineers to perform protection coordination studies on overhead distribution systems. This tool helps engineers input basic feeder and protection device information, estimate fault currents, and visualize time-current curves (TCCs) on a log-log plot.

## Features

### ✅ Core Features
- **Substation Input Form**: Configure nominal voltage and available fault current
- **Device Management**: Add fuses, reclosers, and TripSavers with detailed parameters
- **Preloaded Curve Library**: Built-in time-current curves for common protection devices
- **Fault Current Estimation**: Automatic calculation of fault currents at each device location
- **TCC Plot**: Interactive log-log plot showing device curves and fault current markers
- **Coordination Checker**: Automatic detection of potential miscoordination issues
- **Save/Load Studies**: Export and import study data as JSON files

### 🎯 Engineering Logic
- **Fault Current Estimation**: Uses distance-based formula: `faultCurrent = sourceCurrent / (1 + distance * 0.5)`
- **Coordination Analysis**: Checks for downstream devices operating before upstream devices
- **Time Dial Support**: Configurable time dial settings for reclosers
- **Curve Interpolation**: Linear interpolation between curve points for accurate timing

### 📊 Visualization
- **Log-Log Plot**: Standard TCC format with current (A) vs time (seconds)
- **Color-Coded Curves**: Each device gets a unique color for easy identification
- **Fault Current Markers**: Diamond markers show estimated fault levels
- **Interactive Plot**: Zoom, pan, and hover for detailed information

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gridsync
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### 1. Configure Substation
- Enter the nominal voltage (typically 12.47 kV)
- Set the available fault current at the source

### 2. Add Protection Devices
- Select device type (Fuse, Recloser, TripSaver)
- Choose from preloaded curve types
- Set pickup current and distance from substation
- Configure time dial for reclosers

### 3. Analyze Coordination
- View the TCC plot to see device curves
- Check the coordination analysis panel for warnings
- Fault current markers show estimated levels at each device

### 4. Save Your Study
- Click "Save Study" to export as JSON
- Use "Load Study" to import previous studies
- Start fresh with "New Study"

## Deployment

### Netlify Deployment

GridSync is configured for easy deployment on Netlify with the following setup:

#### Automatic Deployment (Recommended)
1. **Connect to GitHub**: Link your GitHub repository to Netlify
2. **Build Settings**: 
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18
3. **Environment Variables**: No additional environment variables required
4. **Deploy**: Netlify will automatically deploy on every push to main/master branch

#### Manual Deployment
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure redirects for SPA routing (handled by `netlify.toml`)

### GitHub Actions (Optional)
The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) for automated deployment. To use it:

1. **Set up Netlify Secrets**:
   - `NETLIFY_AUTH_TOKEN`: Your Netlify authentication token
   - `NETLIFY_SITE_ID`: Your Netlify site ID

2. **Enable GitHub Actions**: The workflow will run on pushes to main/master branch

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Technical Details

### Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Plotting**: Plotly.js
- **State Management**: React hooks (useState, useEffect)
- **Deployment**: Netlify + GitHub Actions

### Project Structure
```
src/
├── components/          # React components
│   ├── Header.jsx      # App header with actions
│   ├── SubstationForm.jsx
│   ├── DeviceForm.jsx
│   ├── TCCPlot.jsx     # Plotly.js integration
│   ├── DeviceList.jsx
│   ├── WarningsPanel.jsx
│   ├── FaultSimulationPanel.jsx
│   ├── FaultLocationEstimator.jsx
│   ├── DeviceOperationTimeline.jsx
│   ├── FeederOneLineDiagram.jsx
│   └── TabbedInterface.jsx
├── data/
│   ├── curveLibrary.js # Preloaded TCC curves
│   └── conductorData.js # Conductor impedance data
├── utils/
│   ├── engineeringUtils.js # Engineering calculations
│   ├── faultSimulation.js # Fault simulation logic
│   └── faultLocationEstimator.js # Fault location estimation
└── App.jsx             # Main application
```

### Curve Library
The application includes preloaded curves for:
- **Fuses**: S&C K-50, K-100, K-200
- **Reclosers**: SEL IEEE C, D, E curves
- **TripSavers**: 50A, 100A, 200A models

## Engineering Background

### Protection Coordination
Protection coordination ensures that during a fault, the device closest to the fault operates first, while upstream devices provide backup protection. This prevents unnecessary outages and improves system reliability.

### Time-Current Curves (TCC)
TCC plots show the operating time of protection devices versus fault current. The log-log format allows engineers to visualize coordination across a wide range of currents and times.

### Fault Current Estimation
The simplified fault current model accounts for impedance increase with distance from the substation, providing reasonable estimates for coordination studies.

## Future Enhancements

### Stretch Goals
- **Recommendation Engine**: Suggest optimal settings based on coordination issues
- **Advanced Fault Models**: More sophisticated fault current calculations
- **Multiple Feeder Support**: Handle complex distribution systems
- **Report Generation**: Export coordination studies as PDF reports
- **Real-time Collaboration**: Share studies with team members

## Contributing

This is an MVP focused on core functionality. Future development will prioritize:
1. Enhanced engineering accuracy
2. Improved user experience
3. Additional device types and curves
4. Advanced analysis features

## License

This project is developed for utility engineering applications.
