import React, { useState, useEffect } from 'react';
import { simulateFault, getFaultTypeOptions, getInputModeOptions } from '../utils/faultSimulation';

const FaultSimulationPanel = ({ devices, substation, resetTrigger, onFaultLocationUpdate, onSimulationResults }) => {
  const [faultType, setFaultType] = useState('Single-Line-to-Ground');
  const [inputMode, setInputMode] = useState('distance');
  const [faultInput, setFaultInput] = useState('');
  const [simulationResults, setSimulationResults] = useState(null);

  // Reset simulation when resetTrigger changes
  useEffect(() => {
    setFaultType('Single-Line-to-Ground');
    setInputMode('distance');
    setFaultInput('');
    setSimulationResults(null);
    if (onFaultLocationUpdate) {
      onFaultLocationUpdate(null);
    }
    if (onSimulationResults) {
      onSimulationResults(null);
    }
  }, [resetTrigger, onFaultLocationUpdate, onSimulationResults]);

  const faultTypeOptions = getFaultTypeOptions();
  const inputModeOptions = getInputModeOptions();

  const handleSimulate = () => {
    if (!faultInput || devices.length === 0) return;
    
    const inputValue = parseFloat(faultInput);
    if (isNaN(inputValue) || inputValue <= 0) return;
    
    const results = simulateFault(devices, substation, faultType, inputValue, inputMode);
    setSimulationResults(results);
    
    // Pass results to parent component for timeline display
    if (onSimulationResults) {
      onSimulationResults(results);
    }
    
    // Update fault location for one-line diagram
    if (onFaultLocationUpdate && results.length > 0) {
      const firstClearingDevice = results.find(r => r.clears);
      if (firstClearingDevice) {
        onFaultLocationUpdate({
          estimatedDistance: firstClearingDevice.distance,
          nearestDevice: firstClearingDevice.device
        });
      }
    }
  };

  const getInputLabel = () => {
    return inputMode === 'distance' ? 'Distance from Substation (miles)' : 'Fault Current (amps)';
  };

  const getInputPlaceholder = () => {
    return inputMode === 'distance' ? 'e.g., 2.5' : 'e.g., 5000';
  };

  const formatTime = (time) => {
    if (time === null) return 'N/A';
    return `${time.toFixed(3)}s`;
  };

  const formatCurrent = (current) => {
    if (current >= 1000) {
      return `${(current / 1000).toFixed(1)} kA`;
    }
    return `${current.toFixed(0)} A`;
  };

  return (
    <div className="card">
             <h2 className="text-lg font-semibold text-gray-100 mb-4">Fault Simulation</h2>
      
      {/* Input Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Fault Type</label>
          <select 
            value={faultType} 
            onChange={(e) => setFaultType(e.target.value)}
            className="input-field"
          >
            {faultTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Input Mode</label>
          <div className="flex space-x-4">
            {inputModeOptions.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="inputMode"
                  value={option.value}
                  checked={inputMode === option.value}
                  onChange={(e) => setInputMode(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-200">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">{getInputLabel()}</label>
          <input
            type="number"
            value={faultInput}
            onChange={(e) => setFaultInput(e.target.value)}
            placeholder={getInputPlaceholder()}
            className="input-field"
            step="0.1"
            min="0"
          />
        </div>

        <button
          onClick={handleSimulate}
          disabled={!faultInput || devices.length === 0}
          className="btn-primary w-full"
        >
          Simulate Fault
        </button>
      </div>

      {/* Results */}
      {simulationResults && (
        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-300 mb-2">Simulation Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-300">Fault Type:</span> <span className="text-gray-100">{simulationResults.faultType}</span>
              </div>
              <div>
                <span className="text-blue-300">Fault Current:</span> <span className="text-gray-100">{formatCurrent(simulationResults.faultCurrent)}</span>
              </div>
              <div>
                <span className="text-blue-300">Devices Clearing:</span> <span className="text-gray-100">{simulationResults.totalDevicesClearing}</span>
              </div>
              <div>
                <span className="text-blue-300">First Clearing:</span> <span className="text-gray-100">{simulationResults.firstClearingDevice?.device.name || 'None'}</span>
              </div>
              <div>
                <span className="text-blue-300">Total Operations:</span> <span className="text-gray-100">
                  {simulationResults.deviceResults.reduce((total, result) => total + (result.operations?.length || 0), 0)}
                </span>
              </div>
              <div>
                <span className="text-blue-300">Max Operation Time:</span> <span className="text-gray-100">
                  {formatTime(Math.max(...simulationResults.deviceResults.map(r => 
                    r.operations ? Math.max(...r.operations.map(op => op.time + op.duration)) : 0
                  )))}
                </span>
              </div>
            </div>
          </div>

          {/* Device Results Table */}
          <div>
            <h3 className="text-sm font-medium text-gray-100 mb-2">Device Operation Sequence</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Device</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Distance</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Trip Time</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Operations</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  {simulationResults.deviceResults.map((result, index) => (
                    <tr 
                      key={result.device.name}
                      className={index === 0 ? 'bg-green-900/20 border-l-4 border-green-400' : ''}
                    >
                      <td className="px-3 py-2 text-sm text-gray-100 font-medium">
                        {result.device.name}
                        {index === 0 && <span className="ml-2 text-green-400">(First)</span>}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-300">{result.deviceType}</td>
                      <td className="px-3 py-2 text-sm text-gray-300">{result.distance} mi</td>
                      <td className="px-3 py-2 text-sm text-gray-300">{formatTime(result.tripTime)}</td>
                      <td className="px-3 py-2 text-sm text-gray-300">
                        {result.operations && result.operations.length > 0 ? (
                          <div className="space-y-1">
                            {result.operations.map((op, opIndex) => (
                              <div key={opIndex} className="text-xs">
                                <span className={`inline-block px-1 py-0.5 rounded text-xs ${
                                  op.type === 'Trip' ? 'bg-red-600 text-white' :
                                  op.type === 'Reclose' ? 'bg-green-600 text-white' :
                                  op.type === 'Lockout' ? 'bg-gray-600 text-white' :
                                  op.type === 'Fuse Open' ? 'bg-orange-600 text-white' :
                                  'bg-blue-600 text-white'
                                }`}>
                                  {op.type}
                                </span>
                                <span className="ml-1 text-gray-400">
                                  {formatTime(op.time)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {result.clears ? (
                          <span className="text-green-400">✅ Clears</span>
                        ) : (
                          <span className="text-gray-500">❌ No Trip</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Miscoordination Warnings */}
          {simulationResults.miscoordinationIssues.length > 0 && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-300 mb-2">⚠️ Miscoordination Detected</h3>
              <div className="space-y-2">
                {simulationResults.miscoordinationIssues.map((issue, index) => (
                  <div key={index} className="text-sm text-red-200">
                    <p>
                      <strong className="text-red-100">{issue.downstreamDevice.name}</strong> (downstream) operates before{' '}
                      <strong className="text-red-100">{issue.upstreamDevice.name}</strong> (upstream) by{' '}
                      <strong className="text-red-100">{issue.timeDifference.toFixed(3)}s</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {simulationResults.deviceResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No devices will clear for this fault scenario.</p>
            </div>
          )}
        </div>
      )}

      {devices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Add protection devices to simulate fault scenarios.</p>
        </div>
      )}
    </div>
  );
};

export default FaultSimulationPanel; 