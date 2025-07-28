import React, { useState } from 'react';
import { estimateFaultCurrent } from '../utils/engineeringUtils';

const DeviceList = ({ devices, onRemoveDevice, onUpdateDevice }) => {
  const [editingDevice, setEditingDevice] = useState(null);

  const handleEdit = (device) => {
    setEditingDevice(device);
  };

  const handleSave = (deviceId) => {
    if (editingDevice) {
      onUpdateDevice(deviceId, editingDevice);
      setEditingDevice(null);
    }
  };

  const handleCancel = () => {
    setEditingDevice(null);
  };

  const handleChange = (field, value) => {
    setEditingDevice({
      ...editingDevice,
      [field]: value
    });
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'fuse':
        return '⚡';
      case 'recloser':
        return '🔄';
      case 'tripsaver':
        return '🛡️';
      default:
        return '⚙️';
    }
  };

  const getDeviceColor = (deviceType) => {
    switch (deviceType) {
      case 'fuse':
        return 'bg-red-100 text-red-800';
      case 'recloser':
        return 'bg-blue-100 text-blue-800';
      case 'tripsaver':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card">
             <h2 className="text-lg font-semibold text-gray-100 mb-4">Protection Devices</h2>
      
      {devices.length === 0 ? (
                 <div className="text-center py-8 text-gray-400">
           <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p>No devices added yet</p>
          <p className="text-sm">Add protection devices to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => (
            <div key={device.id} className="border border-gray-200 rounded-lg p-4">
              {editingDevice?.id === device.id ? (
                // Edit mode
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{getDeviceIcon(device.deviceType)}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(device.id)}
                        className="text-sm bg-green-600 text-white px-2 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-sm bg-gray-600 text-white px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-200">Name</label>
                      <input
                        type="text"
                        value={editingDevice.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-200">Distance (mi)</label>
                      <input
                        type="number"
                        value={editingDevice.distance}
                        onChange={(e) => handleChange('distance', e.target.value)}
                        className="input-field text-sm"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-200">Pickup (A)</label>
                      <input
                        type="number"
                        value={editingDevice.pickupAmps}
                        onChange={(e) => handleChange('pickupAmps', e.target.value)}
                        className="input-field text-sm"
                      />
                    </div>
                    {device.deviceType === 'recloser' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-200">Time Dial</label>
                        <input
                          type="number"
                          value={editingDevice.timeDial || ''}
                          onChange={(e) => handleChange('timeDial', e.target.value)}
                          className="input-field text-sm"
                          step="0.1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // View mode
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getDeviceIcon(device.deviceType)}</span>
                      <span className="font-medium">{device.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeviceColor(device.deviceType)}`}>
                        {device.deviceType}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(device)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onRemoveDevice(device.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Curve:</span>
                      <div className="font-medium">{device.curveType}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Pickup:</span>
                      <div className="font-medium">{device.pickupAmps} A</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Distance:</span>
                      <div className="font-medium">{device.distance} mi</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Fault Current:</span>
                      <div className="font-medium">
                        {(estimateFaultCurrent(5000, device.distance) / 1000).toFixed(1)} kA
                      </div>
                    </div>
                    {device.timeDial && (
                      <div>
                        <span className="text-gray-400">Time Dial:</span>
                        <div className="font-medium">{device.timeDial}</div>
                      </div>
                    )}
                    
                    {/* Enhanced recloser settings display */}
                    {(device.deviceType === 'recloser' || device.deviceType === 'tripsaver') && device.recloseCount !== undefined && (
                      <>
                        <div>
                          <span className="text-gray-400">Reclose Count:</span>
                          <div className="font-medium">{device.recloseCount}</div>
                        </div>
                        {device.recloseDelays && device.recloseDelays.length > 0 && (
                          <div>
                            <span className="text-gray-400">Reclose Delays:</span>
                            <div className="font-medium text-xs">
                              {device.recloseDelays.slice(0, device.recloseCount).map((delay, i) => 
                                `${delay}s${i < device.recloseCount - 1 ? ', ' : ''}`
                              ).join('')}
                            </div>
                          </div>
                        )}
                        {device.lockoutAfter && (
                          <div>
                            <span className="text-gray-400">Lockout:</span>
                            <div className="font-medium text-green-400">Yes</div>
                          </div>
                        )}
                        {device.manualReset && (
                          <div>
                            <span className="text-gray-400">Manual Reset:</span>
                            <div className="font-medium text-yellow-400">Required</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeviceList; 