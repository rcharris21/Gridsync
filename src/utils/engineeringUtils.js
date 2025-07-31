import { curveLibrary } from '../data/curveLibrary.js';
import { conductorData, temperatureFactors } from '../data/conductorData.js';

// Calculate cumulative distance from substation for each device
export const calculateCumulativeDistances = (devices) => {
  const sortedDevices = [...devices].sort((a, b) => a.distance - b.distance);
  let cumulativeDistance = 0;
  
  return sortedDevices.map(device => {
    cumulativeDistance += device.distance;
    return {
      ...device,
      cumulativeDistance: cumulativeDistance
    };
  });
};

// Calculate fault current at a specific device using cumulative distances and different conductors
export const calculateFaultCurrentAtDevice = (devices, substation, targetDeviceIndex) => {
  const sortedDevices = [...devices].sort((a, b) => a.distance - b.distance);
  const targetDevice = sortedDevices[targetDeviceIndex];
  
  if (!targetDevice) return substation.availableFaultCurrent;
  
  let totalImpedance = 0;
  let currentDistance = 0;
  
  // Calculate impedance from substation to target device
  for (let i = 0; i <= targetDeviceIndex; i++) {
    const device = sortedDevices[i];
    const sectionDistance = device.distance;
    const conductorType = device.conductorType || substation.defaultConductor || 'ACSR 1/0';
    
    if (!conductorData[conductorType]) {
      // Fallback to simplified calculation
      totalImpedance += sectionDistance * 0.5; // 0.5 ohms/mile default
    } else {
      const conductor = conductorData[conductorType];
      const tempFactor = temperatureFactors[substation.temperature || 75] || 1.0;
      
      // Calculate line impedance for this section
      const resistance = conductor.resistance * sectionDistance * tempFactor;
      const reactance = conductor.reactance * sectionDistance;
      const impedance = Math.sqrt(resistance * resistance + reactance * reactance);
      
      totalImpedance += impedance;
    }
    
    currentDistance += sectionDistance;
  }
  
  // Calculate fault current using voltage drop method
  const systemVoltage = substation.nominalVoltage * 1000; // Convert kV to V
  const voltageDrop = substation.availableFaultCurrent * totalImpedance;
  const voltageAtFault = systemVoltage - voltageDrop;
  
  // Fault current at device location
  const faultCurrent = voltageAtFault / totalImpedance;
  
  return Math.max(faultCurrent, substation.availableFaultCurrent * 0.1); // Minimum 10% of source current
};

// Accurate fault current calculation using conductor impedance (legacy - kept for backward compatibility)
export const calculateFaultCurrent = (sourceFaultCurrent, distanceInMiles, conductorType, temperature = 75) => {
  if (!conductorType || !conductorData[conductorType]) {
    // Fallback to simplified method if no conductor data
    return estimateFaultCurrent(sourceFaultCurrent, distanceInMiles);
  }

  const conductor = conductorData[conductorType];
  const tempFactor = temperatureFactors[temperature] || 1.0;
  
  // Calculate line impedance
  const resistance = conductor.resistance * distanceInMiles * tempFactor;
  const reactance = conductor.reactance * distanceInMiles;
  const impedance = Math.sqrt(resistance * resistance + reactance * reactance);
  
  // For 12.47kV system, calculate voltage drop and fault current
  const systemVoltage = 12470; // 12.47kV in volts
  const voltageDrop = sourceFaultCurrent * impedance;
  const voltageAtFault = systemVoltage - voltageDrop;
  
  // Fault current at device location
  const faultCurrent = voltageAtFault / impedance;
  
  return Math.max(faultCurrent, sourceFaultCurrent * 0.1); // Minimum 10% of source current
};

// Legacy simplified method (kept for backward compatibility)
export const estimateFaultCurrent = (sourceFaultCurrent, distanceInMiles) => {
  return sourceFaultCurrent / (1 + distanceInMiles * 0.5);
};

// Calculate operating time for a device at a given current
export const calculateOperatingTime = (device, current) => {
  const curve = curveLibrary[device.curveType];
  if (!curve) return null;
  
  const curvePoints = curve.curve;
  
  // Find the two points that bracket the current
  let lowerPoint = null;
  let upperPoint = null;
  
  for (let i = 0; i < curvePoints.length - 1; i++) {
    if (curvePoints[i][0] <= current && curvePoints[i + 1][0] >= current) {
      lowerPoint = curvePoints[i];
      upperPoint = curvePoints[i + 1];
      break;
    }
  }
  
  if (!lowerPoint || !upperPoint) return null;
  
  // Linear interpolation between the two points
  const [lowerCurrent, lowerTime] = lowerPoint;
  const [upperCurrent, upperTime] = upperPoint;
  
  const time = lowerTime + (upperTime - lowerTime) * (current - lowerCurrent) / (upperCurrent - lowerCurrent);
  
  // Apply time dial if applicable (for reclosers)
  if (device.timeDial && device.deviceType === 'recloser') {
    return time * device.timeDial;
  }
  
  return time;
};

// Generate specific recommendations for coordination issues
export const generateRecommendations = (warning, devices, substation) => {
  const recommendations = [];
  const philosophy = substation.coordinationPhilosophy || 'fuse-saving';
  
  if (warning.type === 'miscoordination') {
    const [upstreamDevice, downstreamDevice] = warning.devices;
    
    // Device-specific recommendations based on coordination philosophy
    if (upstreamDevice.deviceType === 'recloser' && downstreamDevice.deviceType === 'fuse') {
      if (philosophy === 'fuse-saving') {
        // Fuse-saving: Delay upstream to allow fuse operation
        recommendations.push({
          type: 'time_dial',
          message: `Increase ${upstreamDevice.name} time dial from ${upstreamDevice.timeDial || 1} to ${Math.min((upstreamDevice.timeDial || 1) * 1.8, 10)} for fuse-saving coordination`,
          action: 'increase_time_dial',
          device: upstreamDevice,
          newValue: Math.min((upstreamDevice.timeDial || 1) * 1.8, 10)
        });
        
        recommendations.push({
          type: 'curve_selection',
          message: `Consider changing ${upstreamDevice.name} curve to a slower curve (IEEE E or F) for fuse-saving coordination`,
          action: 'change_curve',
          device: upstreamDevice,
          suggestedCurves: ['IEEE E', 'IEEE F', 'ANSI Very Inverse']
        });
      } else {
        // Fuse-blowing: Fast upstream operation to protect fuses
        recommendations.push({
          type: 'time_dial',
          message: `Decrease ${upstreamDevice.name} time dial from ${upstreamDevice.timeDial || 1} to ${Math.max((upstreamDevice.timeDial || 1) * 0.7, 0.5)} for fuse-blowing coordination`,
          action: 'decrease_time_dial',
          device: upstreamDevice,
          newValue: Math.max((upstreamDevice.timeDial || 1) * 0.7, 0.5)
        });
        
        recommendations.push({
          type: 'curve_selection',
          message: `Consider changing ${upstreamDevice.name} curve to a faster curve (IEEE C or D) for fuse-blowing coordination`,
          action: 'change_curve',
          device: upstreamDevice,
          suggestedCurves: ['IEEE C', 'IEEE D', 'ANSI Moderately Inverse']
        });
      }
    }
    
    if (upstreamDevice.deviceType === 'recloser' && downstreamDevice.deviceType === 'recloser') {
      if (philosophy === 'fuse-saving') {
        // For recloser-to-recloser, still maintain coordination but with philosophy context
        recommendations.push({
          type: 'time_dial',
          message: `Increase ${upstreamDevice.name} time dial from ${upstreamDevice.timeDial || 1} to ${Math.min((upstreamDevice.timeDial || 1) * 1.4, 8)} for fuse-saving coordination`,
          action: 'increase_time_dial',
          device: upstreamDevice,
          newValue: Math.min((upstreamDevice.timeDial || 1) * 1.4, 8)
        });
      } else {
        // Fuse-blowing: Faster coordination for reclosers too
        recommendations.push({
          type: 'time_dial',
          message: `Adjust ${upstreamDevice.name} time dial from ${upstreamDevice.timeDial || 1} to ${Math.min((upstreamDevice.timeDial || 1) * 1.2, 6)} for fuse-blowing coordination`,
          action: 'adjust_time_dial',
          device: upstreamDevice,
          newValue: Math.min((upstreamDevice.timeDial || 1) * 1.2, 6)
        });
      }
    }
    
    if (downstreamDevice.deviceType === 'fuse') {
      const currentFuse = downstreamDevice.curveType;
      
      if (philosophy === 'fuse-saving') {
        // Fuse-saving: Allow fuses to operate, suggest appropriate sizing
        const fuseUpgrades = {
          'S&C K-25': 'S&C K-35',
          'S&C K-35': 'S&C K-50', 
          'S&C K-50': 'S&C K-75',
          'S&C K-75': 'S&C K-100',
          'Cooper K-25': 'Cooper K-35',
          'Cooper K-35': 'Cooper K-50',
          'Cooper K-50': 'Cooper K-75',
          'Cooper K-75': 'Cooper K-100'
        };
        
        if (fuseUpgrades[currentFuse]) {
          recommendations.push({
            type: 'fuse_upgrade',
            message: `Consider upgrading ${downstreamDevice.name} from ${currentFuse} to ${fuseUpgrades[currentFuse]} for fuse-saving coordination`,
            action: 'change_fuse',
            device: downstreamDevice,
            newFuse: fuseUpgrades[currentFuse]
          });
        }
      } else {
        // Fuse-blowing: Protect fuses from damage, suggest conservative sizing
        const fuseDowngrades = {
          'S&C K-100': 'S&C K-75',
          'S&C K-75': 'S&C K-50',
          'S&C K-50': 'S&C K-35',
          'S&C K-35': 'S&C K-25',
          'Cooper K-100': 'Cooper K-75',
          'Cooper K-75': 'Cooper K-50',
          'Cooper K-50': 'Cooper K-35',
          'Cooper K-35': 'Cooper K-25'
        };
        
        if (fuseDowngrades[currentFuse]) {
          recommendations.push({
            type: 'fuse_downgrade',
            message: `Consider downgrading ${downstreamDevice.name} from ${currentFuse} to ${fuseDowngrades[currentFuse]} for fuse-blowing coordination`,
            action: 'change_fuse',
            device: downstreamDevice,
            newFuse: fuseDowngrades[currentFuse]
          });
        }
      }
    }
    
    if (downstreamDevice.deviceType === 'TripSaver') {
      if (philosophy === 'fuse-saving') {
        recommendations.push({
          type: 'tripsaver_settings',
          message: `Review ${downstreamDevice.name} settings for fuse-saving coordination - TripSavers should operate before upstream devices`,
          action: 'review_tripsaver',
          device: downstreamDevice
        });
      } else {
        recommendations.push({
          type: 'tripsaver_settings',
          message: `Review ${downstreamDevice.name} settings for fuse-blowing coordination - Upstream devices should protect TripSavers`,
          action: 'review_tripsaver',
          device: downstreamDevice
        });
      }
    }
  }
  
  if (warning.type === 'tight_coordination') {
    const [upstreamDevice, downstreamDevice] = warning.devices;
    
    if (philosophy === 'fuse-saving') {
      recommendations.push({
        type: 'margin_increase',
        message: `Increase coordination margin between ${upstreamDevice.name} and ${downstreamDevice.name} for fuse-saving coordination`,
        action: 'increase_margin',
        devices: [upstreamDevice, downstreamDevice]
      });
    } else {
      recommendations.push({
        type: 'margin_increase',
        message: `Review coordination margin between ${upstreamDevice.name} and ${downstreamDevice.name} for fuse-blowing coordination`,
        action: 'review_margin',
        devices: [upstreamDevice, downstreamDevice]
      });
    }
  }
  
  // General recommendations based on device types and philosophy
  if (recommendations.length === 0) {
    if (philosophy === 'fuse-saving') {
      recommendations.push({
        type: 'general',
        message: 'Review device settings for fuse-saving coordination - consider slower curves and longer delays',
        action: 'review_settings'
      });
    } else {
      recommendations.push({
        type: 'general',
        message: 'Review device settings for fuse-blowing coordination - consider faster curves and shorter delays',
        action: 'review_settings'
      });
    }
  }
  
  return recommendations;
};

// Check for coordination issues between devices
export const checkCoordination = (devices, substation) => {
  const warnings = [];
  
  // Sort devices by cumulative distance from substation (upstream to downstream)
  const devicesWithCumulativeDistances = calculateCumulativeDistances(devices);
  const sortedDevices = devicesWithCumulativeDistances.sort((a, b) => a.cumulativeDistance - b.cumulativeDistance);
  
  for (let i = 0; i < sortedDevices.length - 1; i++) {
    const upstreamDevice = sortedDevices[i];
    const downstreamDevice = sortedDevices[i + 1];
    
    // Calculate fault current at downstream device using cumulative distance method
    const downstreamIndex = sortedDevices.findIndex(d => d.id === downstreamDevice.id);
    const faultCurrent = calculateFaultCurrentAtDevice(sortedDevices, substation, downstreamIndex);
    
    // Calculate operating times
    const upstreamTime = calculateOperatingTime(upstreamDevice, faultCurrent);
    const downstreamTime = calculateOperatingTime(downstreamDevice, faultCurrent);
    
    if (upstreamTime && downstreamTime) {
      // Check if downstream device operates before upstream device
      if (downstreamTime < upstreamTime) {
        const timeDifference = upstreamTime - downstreamTime;
        const warning = {
          type: 'miscoordination',
          message: `⚠ ${downstreamDevice.deviceType} ${downstreamDevice.name} clears before ${upstreamDevice.deviceType} ${upstreamDevice.name} at ${(faultCurrent/1000).toFixed(1)} kA — potential miscoordination (${timeDifference.toFixed(2)}s difference)`,
          severity: 'high',
          devices: [upstreamDevice, downstreamDevice],
          faultCurrent: faultCurrent
        };
        
        // Generate specific recommendations for this warning
        warning.recommendations = generateRecommendations(warning, devices, substation);
        warnings.push(warning);
      }
      
      // Check if coordination margin is too small (< 0.2 seconds)
      if (upstreamTime - downstreamTime < 0.2) {
        const warning = {
          type: 'tight_coordination',
          message: `⚠ Tight coordination between ${upstreamDevice.deviceType} ${upstreamDevice.name} and ${downstreamDevice.deviceType} ${downstreamDevice.name} at ${(faultCurrent/1000).toFixed(1)} kA`,
          severity: 'medium',
          devices: [upstreamDevice, downstreamDevice],
          faultCurrent: faultCurrent
        };
        
        // Generate specific recommendations for this warning
        warning.recommendations = generateRecommendations(warning, devices, substation);
        warnings.push(warning);
      }
    }
  }
  
  return warnings;
};

// Generate curve data for plotting
export const generateCurveData = (device) => {
  const curve = curveLibrary[device.curveType];
  if (!curve) return null;
  
  const curvePoints = curve.curve;
  let times = curvePoints.map(point => point[1]);
  let currents = curvePoints.map(point => point[0]);
  
  // Apply time dial if applicable
  if (device.timeDial && device.deviceType === 'recloser') {
    times = times.map(time => time * device.timeDial);
  }
  
  return {
    x: currents,
    y: times,
    name: device.name,
    type: 'scatter',
    mode: 'lines+markers',
    line: { width: 2 },
    marker: { size: 4 }
  };
};

// Generate philosophy-aware device recommendations
export const generatePhilosophyRecommendations = (substation, deviceType) => {
  const philosophy = substation.coordinationPhilosophy || 'fuse-saving';
  const recommendations = [];
  
  if (deviceType === 'recloser') {
    if (philosophy === 'fuse-saving') {
      recommendations.push({
        type: 'curve_recommendation',
        message: 'Recommended curves for fuse-saving: IEEE E, IEEE F, or ANSI Very Inverse',
        curves: ['IEEE E', 'IEEE F', 'ANSI Very Inverse']
      });
      recommendations.push({
        type: 'time_dial_recommendation',
        message: 'Recommended time dial range: 2.0 - 8.0 for fuse-saving coordination',
        range: [2.0, 8.0]
      });
    } else {
      recommendations.push({
        type: 'curve_recommendation',
        message: 'Recommended curves for fuse-blowing: IEEE C, IEEE D, or ANSI Moderately Inverse',
        curves: ['IEEE C', 'IEEE D', 'ANSI Moderately Inverse']
      });
      recommendations.push({
        type: 'time_dial_recommendation',
        message: 'Recommended time dial range: 0.5 - 3.0 for fuse-blowing coordination',
        range: [0.5, 3.0]
      });
    }
  }
  
  if (deviceType === 'fuse') {
    if (philosophy === 'fuse-saving') {
      recommendations.push({
        type: 'fuse_recommendation',
        message: 'Select fuses that can clear faults before upstream devices operate',
        philosophy: 'fuse-saving'
      });
    } else {
      recommendations.push({
        type: 'fuse_recommendation',
        message: 'Select conservative fuse sizes to prevent damage from upstream operation',
        philosophy: 'fuse-blowing'
      });
    }
  }
  
  if (deviceType === 'tripsaver') {
    if (philosophy === 'fuse-saving') {
      recommendations.push({
        type: 'tripsaver_recommendation',
        message: 'Configure TripSaver for single-shot operation to clear faults before upstream devices',
        philosophy: 'fuse-saving'
      });
    } else {
      recommendations.push({
        type: 'tripsaver_recommendation',
        message: 'Configure TripSaver with conservative settings to prevent damage from upstream operation',
        philosophy: 'fuse-blowing'
      });
    }
  }
  
  return recommendations;
};

// Calculate voltage drop along the line
export const calculateVoltageDrop = (current, distanceInMiles, conductorType, temperature = 75) => {
  if (!conductorType || !conductorData[conductorType]) {
    return 0;
  }
  
  const conductor = conductorData[conductorType];
  const tempFactor = temperatureFactors[temperature] || 1.0;
  
  const resistance = conductor.resistance * distanceInMiles * tempFactor;
  const reactance = conductor.reactance * distanceInMiles;
  const impedance = Math.sqrt(resistance * resistance + reactance * reactance);
  
  return current * impedance;
};

// Check conductor ampacity
export const checkConductorAmpacity = (current, conductorType) => {
  if (!conductorType || !conductorData[conductorType]) {
    return { valid: true, message: "No conductor data available" };
  }
  
  const conductor = conductorData[conductorType];
  const ampacity = conductor.ampacity;
  
  if (current > ampacity) {
    return {
      valid: false,
      message: `Current (${current.toFixed(0)}A) exceeds conductor ampacity (${ampacity}A)`,
      severity: 'high'
    };
  } else if (current > ampacity * 0.8) {
    return {
      valid: true,
      message: `Current (${current.toFixed(0)}A) is close to conductor ampacity (${ampacity}A)`,
      severity: 'medium'
    };
  }
  
  return { valid: true, message: "Conductor ampacity is adequate" };
}; 