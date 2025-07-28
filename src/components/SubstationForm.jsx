import React from 'react';
import { getConductorOptions } from '../data/conductorData';

const SubstationForm = ({ substation, onSubstationChange }) => {
  const handleChange = (field, value) => {
    onSubstationChange({
      ...substation,
      [field]: parseFloat(value) || value
    });
  };

  const conductorOptions = getConductorOptions();

  return (
    <div className="card">
             <h2 className="text-lg font-semibold text-gray-100 mb-4">Substation Parameters</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Nominal Voltage (kV)
          </label>
          <input
            type="number"
            value={substation.nominalVoltage || 12.47}
            onChange={(e) => handleChange('nominalVoltage', e.target.value)}
            className="input-field"
            step="0.01"
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Available Fault Current (A)
          </label>
          <input
            type="number"
            value={substation.availableFaultCurrent || 5000}
            onChange={(e) => handleChange('availableFaultCurrent', e.target.value)}
            className="input-field"
            step="100"
            min="0"
          />
          <p className="text-xs text-gray-400 mt-1">
            Available fault current at the substation source
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Default Conductor Type
          </label>
          <select
            value={substation.defaultConductor || 'ACSR 1/0'}
            onChange={(e) => handleChange('defaultConductor', e.target.value)}
            className="input-field"
          >
            {conductorOptions.map(conductor => (
              <option key={conductor.value} value={conductor.value}>
                {conductor.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Default conductor for fault current calculations
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Ambient Temperature (°C)
          </label>
          <select
            value={substation.temperature || 75}
            onChange={(e) => handleChange('temperature', e.target.value)}
            className="input-field"
          >
            <option value={25}>25°C - Cool</option>
            <option value={50}>50°C - Moderate</option>
            <option value={75}>75°C - Standard Rating</option>
            <option value={90}>90°C - Hot</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Temperature for conductor resistance calculations
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubstationForm; 