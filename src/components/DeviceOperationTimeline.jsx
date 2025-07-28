import React from 'react';

const DeviceOperationTimeline = ({ simulationResults, faultLocation }) => {
  if (!simulationResults || !simulationResults.deviceResults) {
    return null;
  }

  // Sort devices by distance from substation (closest first)
  const sortedDevices = [...simulationResults.deviceResults].sort((a, b) => a.distance - b.distance);
  
  // Find the maximum time for scaling
  const maxTime = Math.max(...sortedDevices.map(device => device.tripTime || 0));
  const timeScale = Math.max(maxTime, 0.1); // Minimum 0.1s scale
  
  // Generate timeline data for each device using enhanced operation data
  const generateDeviceTimeline = (device) => {
    const operations = [];
    
    if (device.operations && device.operations.length > 0) {
      // Use the enhanced operation data from simulation
      device.operations.forEach(op => {
        let color, borderColor;
        
        switch (op.type) {
          case 'Trip':
            color = 'bg-red-500';
            borderColor = 'border-red-600';
            break;
          case 'Reclose':
            color = 'bg-green-500';
            borderColor = 'border-green-600';
            break;
          case 'Lockout':
            color = 'bg-gray-700';
            borderColor = 'border-gray-800';
            break;
          case 'Fuse Open':
            color = 'bg-orange-600';
            borderColor = 'border-orange-700';
            break;
          default:
            color = 'bg-blue-500';
            borderColor = 'border-blue-600';
        }
        
        operations.push({
          type: op.type,
          startTime: op.time,
          endTime: op.time + op.duration,
          color: color,
          borderColor: borderColor,
          current: op.current
        });
      });
    } else if (device.clears) {
      // Fallback to basic operation if no detailed operations
      operations.push({
        type: 'Trip',
        startTime: 0,
        endTime: device.tripTime,
        color: 'bg-red-500',
        borderColor: 'border-red-600'
      });
    }
    
    return operations;
  };

  const formatTime = (time) => {
    return `${(time * 1000).toFixed(0)}ms`;
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'Recloser':
        return (
          <div className="w-4 h-4 border border-current rounded flex flex-col justify-center items-center text-xs">
            <div className="w-2 h-0.5 bg-current mb-0.5"></div>
            <div className="w-2 h-0.5 bg-current"></div>
          </div>
        );
      case 'Fuse':
        return (
          <div className="w-4 h-4 border border-current rounded flex items-center justify-center text-xs">
            <div className="w-2 h-2 flex items-center justify-center">
              <div className="w-1 h-0.5 bg-current transform rotate-45"></div>
              <div className="w-1 h-0.5 bg-current transform -rotate-45 absolute"></div>
            </div>
          </div>
        );
      case 'TripSaver':
        return (
          <div className="w-4 h-4 border border-current rounded flex items-center justify-center text-xs">
            <div className="w-2 h-2 border border-current rounded-full flex items-center justify-center">
              <div className="w-0.5 h-0.5 bg-current"></div>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-4 h-4 border border-current rounded flex items-center justify-center text-xs">
            +
          </div>
        );
    }
  };

  const getDeviceColor = (deviceType) => {
    switch (deviceType) {
      case 'Recloser':
        return 'text-blue-400';
      case 'Fuse':
        return 'text-orange-400';
      case 'TripSaver':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="card mt-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">Device Operation Timeline</h3>
      <p className="text-sm text-gray-400 mb-4">
        Event Timeline: Device Response Over Time
      </p>
      
      <div className="space-y-3">
        {/* Time scale markers */}
        <div className="flex justify-between text-xs text-gray-400 px-4">
          {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map(time => (
            <div key={time} className="text-center">
              <div className="w-px h-2 bg-gray-600 mx-auto mb-1"></div>
              <span>{formatTime(time)}</span>
            </div>
          ))}
        </div>
        
        {/* Timeline grid */}
        <div className="relative">
          {/* Background grid */}
          <div className="absolute inset-0 grid grid-cols-6">
            {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((_, index) => (
              <div key={index} className="border-r border-gray-700"></div>
            ))}
          </div>
          
          {/* Device timelines */}
          <div className="relative space-y-2">
            {sortedDevices.map((device, index) => {
              const operations = generateDeviceTimeline(device);
              const isFirstClearing = index === 0 && device.clears;
              
              return (
                <div 
                  key={device.device.name}
                  className={`flex items-center space-x-3 p-2 rounded ${
                    isFirstClearing ? 'bg-blue-900/20 border border-blue-700' : 'bg-gray-800/50'
                  }`}
                >
                  {/* Device info */}
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div className={`${getDeviceColor(device.deviceType)}`}>
                      {getDeviceIcon(device.deviceType)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-100 truncate">
                        {device.device.name}
                        {isFirstClearing && <span className="ml-2 text-blue-400 text-xs">(First)</span>}
                      </div>
                      <div className="text-xs text-gray-400">
                        {device.deviceType} • {device.distance} mi
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline bars */}
                  <div className="flex-1 relative h-8 bg-gray-900 rounded border border-gray-700 overflow-hidden">
                    {operations.map((operation, opIndex) => (
                      <div
                        key={opIndex}
                        className={`absolute h-full ${operation.color} ${operation.borderColor} border rounded-sm flex items-center justify-center`}
                        style={{
                          left: `${(operation.startTime / timeScale) * 100}%`,
                          width: `${((operation.endTime - operation.startTime) / timeScale) * 100}%`,
                          minWidth: '8px'
                        }}
                        title={`${operation.type} at ${formatTime(operation.startTime)}`}
                      >
                        <span className="text-xs font-medium text-white px-1 truncate">
                          {operation.type}
                        </span>
                      </div>
                    ))}
                    
                    {/* No operation indicator */}
                    {operations.length === 0 && (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-xs text-gray-500">No Trip</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Trip time display */}
                  <div className="text-xs text-gray-400 min-w-0">
                    {device.clears ? (
                      <span className="text-green-400">
                        {formatTime(device.tripTime)}
                      </span>
                    ) : (
                      <span className="text-gray-500">No Trip</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Trip</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Reclose</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-700 rounded"></div>
              <span>Lockout</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-600 rounded"></div>
              <span>Fuse Open</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceOperationTimeline; 