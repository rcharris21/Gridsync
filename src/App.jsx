import { useState, useEffect } from 'react';
import Header from './components/Header';
import SubstationForm from './components/SubstationForm';
import DeviceForm from './components/DeviceForm';
import TCCPlot from './components/TCCPlot';
import DeviceList from './components/DeviceList';
import WarningsPanel from './components/WarningsPanel';
import FaultSimulationPanel from './components/FaultSimulationPanel';
import FaultLocationEstimator from './components/FaultLocationEstimator';
import TabbedInterface from './components/TabbedInterface';
import DeviceOperationTimeline from './components/DeviceOperationTimeline';
import { checkCoordination } from './utils/engineeringUtils';

function App() {
  const [substation, setSubstation] = useState({
    nominalVoltage: 12.47,
    availableFaultCurrent: 5000,
    defaultConductor: 'ACSR 1/0',
    temperature: 75
  });
  
  const [devices, setDevices] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [faultLocation, setFaultLocation] = useState(null);
  const [faultSimulationResults, setFaultSimulationResults] = useState(null);

  // Check coordination whenever devices or substation changes
  useEffect(() => {
    if (devices.length > 0 && substation.availableFaultCurrent) {
      const newWarnings = checkCoordination(devices, substation);
      setWarnings(newWarnings);
    } else {
      setWarnings([]);
    }
  }, [devices, substation]);

  const addDevice = (device) => {
    setDevices([...devices, { ...device, id: Date.now() }]);
  };

  const removeDevice = (deviceId) => {
    setDevices(devices.filter(device => device.id !== deviceId));
  };

  const updateDevice = (deviceId, updatedDevice) => {
    setDevices(devices.map(device => 
      device.id === deviceId ? { ...updatedDevice, id: deviceId } : device
    ));
  };

  const saveStudy = () => {
    const studyData = {
      substation,
      devices,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(studyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gridsync-study-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadStudy = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const studyData = JSON.parse(e.target.result);
          setSubstation(studyData.substation || substation);
          setDevices(studyData.devices || []);
        } catch (error) {
          alert('Error loading study file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const newStudy = () => {
    setSubstation({
      nominalVoltage: 12.47,
      availableFaultCurrent: 5000,
      defaultConductor: 'ACSR 1/0',
      temperature: 75
    });
    setDevices([]);
    setWarnings([]);
    setResetTrigger(prev => prev + 1); // Trigger fault simulation reset
    setFaultLocation(null);
    setFaultSimulationResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header 
        onNewStudy={newStudy}
        onSaveStudy={saveStudy}
        onLoadStudy={loadStudy}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Forms */}
          <div className="lg:col-span-1 space-y-6">
            <SubstationForm 
              substation={substation}
              onSubstationChange={setSubstation}
            />
            <DeviceForm 
              onAddDevice={addDevice}
              substation={substation}
              devices={devices}
            />
          </div>
          
          {/* Main Area - TCC Plot and Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <TCCPlot 
              substation={substation}
              devices={devices}
              warnings={warnings}
              faultLocation={faultLocation}
            />
            
            {/* Device Operation Timeline */}
            {faultSimulationResults && (
              <DeviceOperationTimeline 
                simulationResults={faultSimulationResults}
                faultLocation={faultLocation}
              />
            )}
          </div>
          
          {/* Right Panel - Device List and Warnings */}
          <div className="lg:col-span-1 space-y-6">
            <DeviceList 
              devices={devices}
              onRemoveDevice={removeDevice}
              onUpdateDevice={updateDevice}
            />
            <WarningsPanel warnings={warnings} />
          </div>
        </div>

        {/* Advanced Tools - Tabbed Interface */}
        <div className="mt-8">
          <TabbedInterface
            tabs={[
              { label: 'Fault Simulation', icon: '⚡' },
              { label: 'Fault Location Estimator', icon: '📍' },
              { label: 'Advanced Analysis', icon: '📊' }
            ]}
          >
            <FaultSimulationPanel 
              devices={devices}
              substation={substation}
              resetTrigger={resetTrigger}
              onFaultLocationUpdate={setFaultLocation}
              onSimulationResults={setFaultSimulationResults}
            />
            <FaultLocationEstimator 
              devices={devices}
              substation={substation}
            />
            <div className="p-6 text-center text-gray-500">
              <p className="text-lg font-medium mb-2">Advanced Analysis Tools</p>
              <p className="text-sm">Future tools for advanced protection analysis will appear here.</p>
            </div>
          </TabbedInterface>
        </div>
      </div>
    </div>
  );
}

export default App;
