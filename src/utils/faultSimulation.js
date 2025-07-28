import { calculateOperatingTime, calculateFaultCurrentAtDevice, calculateCumulativeDistances } from './engineeringUtils.js';

// Simplified fault current calculation based on distance
export const calculateFaultCurrentByDistance = (distance, sourceCurrent = 10000, impedancePerMile = 0.5) => {
  return sourceCurrent / (1 + impedancePerMile * distance);
};

// Enhanced device operation simulation with reclose logic
const simulateDeviceOperations = (device, faultCurrent, tripTime) => {
  const operations = [];
  
  if (!tripTime || tripTime >= 100) {
    return operations; // Device doesn't operate
  }
  
  // Add initial trip
  operations.push({
    type: 'Trip',
    time: tripTime,
    duration: 0.05, // Trip duration
    current: faultCurrent
  });
  
  // Handle reclose operations for reclosers and tripsavers
  if (device.deviceType === 'recloser' || device.deviceType === 'tripsaver') {
    const recloseCount = device.recloseCount || 0;
    const recloseDelays = device.recloseDelays || [0.1, 0.3];
    let currentTime = tripTime + 0.05; // Start after trip
    
    for (let i = 0; i < recloseCount; i++) {
      const delay = recloseDelays[i] || 0.1;
      currentTime += delay;
      
      // Add reclose operation
      operations.push({
        type: 'Reclose',
        time: currentTime,
        duration: 0.02, // Reclose duration
        current: faultCurrent
      });
      
      // If fault persists, add another trip
      currentTime += 0.02;
      operations.push({
        type: 'Trip',
        time: currentTime,
        duration: 0.05,
        current: faultCurrent
      });
      
      currentTime += 0.05;
    }
    
    // Add lockout if configured
    if (device.lockoutAfter && recloseCount > 0) {
      operations.push({
        type: 'Lockout',
        time: currentTime,
        duration: 0.1,
        current: faultCurrent
      });
    }
  } else if (device.deviceType === 'fuse') {
    // Fuses operate once and stay open
    operations.push({
      type: 'Fuse Open',
      time: tripTime + 0.05,
      duration: 0.1,
      current: faultCurrent
    });
  }
  
  return operations;
};

// Simulate fault and determine device operation sequence
export const simulateFault = (devices, substation, faultType, faultInput, inputMode) => {
  // Calculate fault current based on input mode
  let faultCurrent;
  if (inputMode === 'distance') {
    faultCurrent = calculateFaultCurrentByDistance(faultInput);
  } else {
    faultCurrent = faultInput;
  }
  
  // Get devices with cumulative distances for accurate fault current calculation
  const devicesWithCumulativeDistances = calculateCumulativeDistances(devices);
  const sortedDevices = devicesWithCumulativeDistances.sort((a, b) => a.cumulativeDistance - b.cumulativeDistance);
  
  // Apply fault type multiplier
  const faultTypeMultipliers = {
    'Single-Line-to-Ground': 1.0,    // Full fault current
    'Phase-Phase': 0.866,            // 87% of three-phase fault
    'Three-Phase': 1.0               // Full fault current
  };
  
  const adjustedFaultCurrent = faultCurrent * (faultTypeMultipliers[faultType] || 1.0);
  
  // Evaluate each device with enhanced operation simulation
  const deviceResults = sortedDevices.map((device, index) => {
    // Calculate fault current at this device using cumulative distance method
    const deviceFaultCurrent = calculateFaultCurrentAtDevice(sortedDevices, substation, index);
    const tripTime = calculateOperatingTime(device, deviceFaultCurrent);
    
    // Generate detailed operation sequence
    const operations = simulateDeviceOperations(device, deviceFaultCurrent, tripTime);
    
    return {
      device,
      faultCurrent: deviceFaultCurrent,
      tripTime,
      clears: tripTime !== null && tripTime < 100, // Reasonable upper limit
      distance: device.cumulativeDistance,
      deviceType: device.deviceType,
      operations: operations,
      totalOperations: operations.length
    };
  });
  
  // Sort by trip time (fastest first)
  const sortedResults = deviceResults
    .filter(result => result.clears)
    .sort((a, b) => a.tripTime - b.tripTime);
  
  // Check for miscoordination (upstream device operates after downstream)
  const miscoordinationIssues = [];
  for (let i = 0; i < sortedResults.length - 1; i++) {
    const current = sortedResults[i];
    const next = sortedResults[i + 1];
    
    // If downstream device (higher distance) operates before upstream device
    if (current.distance > next.distance && current.tripTime < next.tripTime) {
      miscoordinationIssues.push({
        upstreamDevice: next.device,
        downstreamDevice: current.device,
        upstreamTime: next.tripTime,
        downstreamTime: current.tripTime,
        timeDifference: next.tripTime - current.tripTime
      });
    }
  }
  
  return {
    faultType,
    faultCurrent: adjustedFaultCurrent,
    originalFaultCurrent: faultCurrent,
    deviceResults: sortedResults,
    miscoordinationIssues,
    firstClearingDevice: sortedResults.length > 0 ? sortedResults[0] : null,
    totalDevicesClearing: sortedResults.length
  };
};

// Get fault type options
export const getFaultTypeOptions = () => [
  { value: 'Single-Line-to-Ground', label: 'Single-Line-to-Ground' },
  { value: 'Phase-Phase', label: 'Phase-Phase' },
  { value: 'Three-Phase', label: 'Three-Phase' }
];

// Get input mode options
export const getInputModeOptions = () => [
  { value: 'distance', label: 'By Distance' },
  { value: 'current', label: 'By Fault Current' }
]; 