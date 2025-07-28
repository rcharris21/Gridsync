import React, { useState } from 'react';
import { getCurveByType } from '../data/curveLibrary';
import { getConductorOptions } from '../data/conductorData';

const DeviceForm = ({ onAddDevice, substation, devices }) => {
  const [formData, setFormData] = useState({
    deviceType: 'fuse',
    name: '',
    curveType: '',
    pickupAmps: '',
    timeDial: '',
    distance: '',
    conductorType: substation?.defaultConductor || 'ACSR 1/0',
    // Enhanced recloser settings
    recloseCount: 2,
    recloseDelays: [0.1, 0.3],
    lockoutAfter: true,
    manualReset: false
  });

  const deviceTypes = [
    { value: 'fuse', label: 'Fuse' },
    { value: 'recloser', label: 'Recloser' },
    { value: 'tripsaver', label: 'TripSaver' }
  ];

  const curveOptions = getCurveByType(formData.deviceType);
  const conductorOptions = getConductorOptions();
  
  // Get the last device for distance reference
  const sortedDevices = [...devices].sort((a, b) => a.distance - b.distance);
  const lastDevice = sortedDevices[sortedDevices.length - 1];
  const lastDeviceDistance = lastDevice ? lastDevice.distance : 0;

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Reset curve type when device type changes
    if (field === 'deviceType') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        curveType: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.curveType || !formData.pickupAmps || !formData.distance) {
      alert('Please fill in all required fields');
      return;
    }

    const device = {
      deviceType: formData.deviceType,
      name: formData.name,
      curveType: formData.curveType,
      pickupAmps: parseFloat(formData.pickupAmps),
      timeDial: formData.timeDial ? parseFloat(formData.timeDial) : null,
      distance: parseFloat(formData.distance),
      conductorType: formData.conductorType,
      // Enhanced recloser settings
      recloseCount: formData.recloseCount,
      recloseDelays: formData.recloseDelays,
      lockoutAfter: formData.lockoutAfter,
      manualReset: formData.manualReset
    };

    onAddDevice(device);
    
    // Reset form
    setFormData({
      deviceType: 'fuse',
      name: '',
      curveType: '',
      pickupAmps: '',
      timeDial: '',
      distance: '',
      conductorType: substation?.defaultConductor || 'ACSR 1/0',
      // Enhanced recloser settings
      recloseCount: 2,
      recloseDelays: [0.1, 0.3],
      lockoutAfter: true,
      manualReset: false
    });
  };

  return (
    <div className="card">
             <h2 className="text-lg font-semibold text-gray-100 mb-4">Add Protection Device</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
                     <label className="block text-sm font-medium text-gray-200 mb-1">
             Device Type *
           </label>
          <select
            value={formData.deviceType}
            onChange={(e) => handleChange('deviceType', e.target.value)}
            className="input-field"
          >
            {deviceTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Device Name/Label *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="input-field"
            placeholder="e.g., F1, R1, TS1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Curve Type *
          </label>
          <select
            value={formData.curveType}
            onChange={(e) => handleChange('curveType', e.target.value)}
            className="input-field"
          >
            <option value="">Select a curve...</option>
            {curveOptions.map(curve => (
              <option key={curve.value} value={curve.value}>
                {curve.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Pickup Current (A) *
          </label>
          <input
            type="number"
            value={formData.pickupAmps}
            onChange={(e) => handleChange('pickupAmps', e.target.value)}
            className="input-field"
            step="1"
            min="0"
            placeholder="e.g., 100"
          />
        </div>

        {formData.deviceType === 'recloser' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Time Dial
              </label>
              <input
                type="number"
                value={formData.timeDial}
                onChange={(e) => handleChange('timeDial', e.target.value)}
                className="input-field"
                step="0.1"
                min="0.1"
                max="10"
                placeholder="e.g., 1.0"
              />
              <p className="text-xs text-gray-400 mt-1">
                Time dial setting for recloser (0.1 - 10)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Reclose Count
              </label>
              <select
                value={formData.recloseCount}
                onChange={(e) => handleChange('recloseCount', parseInt(e.target.value))}
                className="input-field"
              >
                <option value={1}>1 Reclose</option>
                <option value={2}>2 Recloses</option>
                <option value={3}>3 Recloses</option>
                <option value={4}>4 Recloses</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Number of reclose attempts before lockout
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Reclose Delays (seconds)
              </label>
              <div className="space-y-2">
                {[0, 1, 2, 3].map(index => (
                  <div key={index} className="flex items-center space-x-2">
                    <label className="text-xs text-gray-400 w-8">
                      {index + 1}:
                    </label>
                    <input
                      type="number"
                      value={formData.recloseDelays[index] || ''}
                      onChange={(e) => {
                        const newDelays = [...formData.recloseDelays];
                        newDelays[index] = parseFloat(e.target.value) || 0;
                        handleChange('recloseDelays', newDelays);
                      }}
                      className="input-field flex-1"
                      step="0.1"
                      min="0"
                      placeholder="0.1"
                      disabled={index >= formData.recloseCount}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Delay before each reclose attempt (0 = immediate)
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.lockoutAfter}
                  onChange={(e) => handleChange('lockoutAfter', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-200">Lockout after final reclose</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.manualReset}
                  onChange={(e) => handleChange('manualReset', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-200">Manual reset required</span>
              </label>
            </div>
          </>
        )}

        {formData.deviceType === 'tripsaver' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Time Dial
              </label>
              <input
                type="number"
                value={formData.timeDial}
                onChange={(e) => handleChange('timeDial', e.target.value)}
                className="input-field"
                step="0.1"
                min="0.1"
                max="10"
                placeholder="e.g., 1.0"
              />
              <p className="text-xs text-gray-400 mt-1">
                Time dial setting for tripsaver (0.1 - 10)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Operation Mode
              </label>
              <select
                value={formData.recloseCount}
                onChange={(e) => handleChange('recloseCount', parseInt(e.target.value))}
                className="input-field"
              >
                <option value={0}>Single Shot (No Reclose)</option>
                <option value={1}>1 Reclose</option>
                <option value={2}>2 Recloses</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                TripSaver operation mode (typically single shot)
              </p>
            </div>

            {formData.recloseCount > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Reclose Delays (seconds)
                </label>
                <div className="space-y-2">
                  {[0, 1].map(index => (
                    <div key={index} className="flex items-center space-x-2">
                      <label className="text-xs text-gray-400 w-8">
                        {index + 1}:
                      </label>
                      <input
                        type="number"
                        value={formData.recloseDelays[index] || ''}
                        onChange={(e) => {
                          const newDelays = [...formData.recloseDelays];
                          newDelays[index] = parseFloat(e.target.value) || 0;
                          handleChange('recloseDelays', newDelays);
                        }}
                        className="input-field flex-1"
                        step="0.1"
                        min="0"
                        placeholder="0.1"
                        disabled={index >= formData.recloseCount}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Delay before each reclose attempt
                </p>
              </div>
            )}
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Distance from Last Device (miles) *
          </label>
          <input
            type="number"
            value={formData.distance}
            onChange={(e) => handleChange('distance', e.target.value)}
            className="input-field"
            step="0.1"
            min="0"
            placeholder="e.g., 1.5"
          />
          {lastDevice && (
            <p className="text-xs text-gray-400 mt-1">
              Last device: {lastDevice.name} at {lastDeviceDistance} miles from substation
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Conductor Type (Last Device to This Device)
          </label>
          <select
            value={formData.conductorType}
            onChange={(e) => handleChange('conductorType', e.target.value)}
            className="input-field"
          >
            {conductorOptions.map(conductor => (
              <option key={conductor.value} value={conductor.value}>
                {conductor.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Conductor type from last device to this device for accurate fault current calculation
          </p>
        </div>

        <button
          type="submit"
          className="w-full btn-primary"
        >
          Add Device
        </button>
      </form>
    </div>
  );
};

export default DeviceForm; 