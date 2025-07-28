import React from 'react';
import { calculateCumulativeDistances } from '../utils/engineeringUtils';

const FeederOneLineDiagram = ({ devices, substation, faultLocation = null, miscoordinatedDevices = [] }) => {
  // Calculate cumulative distances for proper spacing
  const devicesWithCumulativeDistances = calculateCumulativeDistances(devices);
  const sortedDevices = devicesWithCumulativeDistances.sort((a, b) => a.cumulativeDistance - b.cumulativeDistance);
  
  const totalFeederLength = sortedDevices.length > 0 
    ? sortedDevices[sortedDevices.length - 1].cumulativeDistance 
    : 0;

  // Device type icons and colors
  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'Recloser':
        return (
          <div className="w-6 h-6 border-2 border-current rounded flex flex-col justify-center items-center text-xs font-bold">
            <div className="w-3 h-0.5 bg-current mb-0.5"></div>
            <div className="w-3 h-0.5 bg-current mb-0.5"></div>
            <div className="w-3 h-0.5 bg-current"></div>
          </div>
        );
      case 'Fuse':
        return (
          <div className="w-6 h-6 border-2 border-current rounded flex items-center justify-center text-xs font-bold">
            <div className="w-3 h-3 flex items-center justify-center">
              <div className="w-2 h-0.5 bg-current transform rotate-45"></div>
              <div className="w-2 h-0.5 bg-current transform -rotate-45 absolute"></div>
            </div>
          </div>
        );
      case 'TripSaver':
        return (
          <div className="w-6 h-6 border-2 border-current rounded flex items-center justify-center text-xs font-bold">
            <div className="w-3 h-3 border border-current rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-current"></div>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 border-2 border-current rounded flex items-center justify-center text-xs font-bold">
            +
          </div>
        );
    }
  };

  const getDeviceColor = (deviceType) => {
    switch (deviceType) {
      case 'Recloser':
        return 'text-blue-600';
      case 'Fuse':
        return 'text-orange-600';
      case 'TripSaver':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDeviceBgColor = (deviceType) => {
    switch (deviceType) {
      case 'Recloser':
        return 'bg-blue-100 border-blue-300';
      case 'Fuse':
        return 'bg-orange-100 border-orange-300';
      case 'TripSaver':
        return 'bg-green-100 border-green-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const isDeviceMiscoordinated = (deviceId) => {
    return miscoordinatedDevices.includes(deviceId);
  };

  const isFaultNearDevice = (deviceDistance) => {
    if (!faultLocation) return false;
    return Math.abs(deviceDistance - faultLocation.estimatedDistance) < 0.5;
  };

  // Format conductor type for display
  const formatConductorType = (conductorType) => {
    if (!conductorType) return 'Unknown';
    return conductorType.replace('ACSR ', '').replace('AAAC ', '').replace('AAC ', '').replace('Copper ', '');
  };

  // Format distance for display
  const formatDistance = (distance) => {
    return `${distance.toFixed(1)} mi`;
  };

  return (
    <div className="card mt-6">
                 <h3 className="text-lg font-semibold text-gray-100 mb-4">Feeder One-Line Diagram</h3>
      
      {devices.length === 0 ? (
                 <div className="text-center py-8 text-gray-400">
           <p>Add protection devices to see the feeder diagram.</p>
         </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-max p-4">
            {/* Main Diagram Container */}
            <div className="flex items-center space-x-2">
              {/* Substation */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-800 flex items-center justify-center text-white text-lg font-bold">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div className="text-xs text-gray-600 mt-1 text-center">
                  <div className="font-medium">Substation</div>
                  <div>{substation.nominalVoltage} kV</div>
                  <div>{(substation.availableFaultCurrent / 1000).toFixed(1)} kA</div>
                </div>
              </div>

              {/* Feeder Segments and Devices */}
              {sortedDevices.map((device, index) => (
                <React.Fragment key={device.id}>
                  {/* Conductor Segment */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center">
                      <div className="h-0.5 bg-gray-400 w-16"></div>
                      <div className="h-0.5 bg-gray-400 w-16"></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 text-center min-w-[8rem]">
                      <div className="font-medium">{formatConductorType(device.conductorType)}</div>
                      <div>{formatDistance(device.distance)}</div>
                    </div>
                  </div>

                  {/* Protection Device */}
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 border-2 flex items-center justify-center
                      ${getDeviceBgColor(device.type)}
                      ${isDeviceMiscoordinated(device.id) ? 'ring-2 ring-red-500' : ''}
                      ${isFaultNearDevice(device.cumulativeDistance) ? 'ring-2 ring-yellow-500 animate-pulse' : ''}
                    `}>
                      <div className={`${getDeviceColor(device.type)}`}>
                        {getDeviceIcon(device.type)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-200 mt-1 text-center font-medium">
                      {device.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {device.curveType}
                    </div>
                    {isDeviceMiscoordinated(device.id) && (
                      <div className="text-xs text-red-600 font-medium mt-1">
                        ⚠️ Miscoordinated
                      </div>
                    )}
                    {isFaultNearDevice(device.cumulativeDistance) && (
                      <div className="text-xs text-yellow-600 font-medium mt-1">
                        ⚡ Fault Near
                      </div>
                    )}
                  </div>
                </React.Fragment>
              ))}

              {/* End of Line */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">End</div>
              </div>
            </div>



            {/* Fault Location Indicator */}
            {faultLocation && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600">⚡</span>
                  <div className="text-sm">
                    <span className="font-medium">Estimated Fault Location:</span>
                    <span className="ml-2">{faultLocation.estimatedDistance.toFixed(1)} miles from substation</span>
                    {faultLocation.nearestDevice && (
                      <span className="ml-2">(near {faultLocation.nearestDevice.name})</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeederOneLineDiagram; 