import { calculateCumulativeDistances } from './engineeringUtils.js';
import { conductorData, temperatureFactors } from '../data/conductorData.js';

// Complex number operations for impedance calculations
class Complex {
  constructor(real, imaginary) {
    this.real = real;
    this.imaginary = imaginary;
  }

  add(other) {
    return new Complex(this.real + other.real, this.imaginary + other.imaginary);
  }

  magnitude() {
    return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary);
  }

  toString() {
    return `${this.real.toFixed(3)} + j${this.imaginary.toFixed(3)}`;
  }
}

// Calculate impedance at a specific point in the feeder
export const calculateImpedanceAtPoint = (devices, substation, targetDistance) => {
  const sortedDevices = [...devices].sort((a, b) => a.distance - b.distance);
  let cumulativeDistance = 0;
  let totalImpedance = new Complex(0, 0);
  
  for (let i = 0; i < sortedDevices.length; i++) {
    const device = sortedDevices[i];
    const sectionDistance = device.distance;
    const conductorType = device.conductorType || substation.defaultConductor || 'ACSR 1/0';
    
    // Check if we've reached the target distance
    if (cumulativeDistance + sectionDistance >= targetDistance) {
      // Calculate partial distance for this section
      const remainingDistance = targetDistance - cumulativeDistance;
      
      if (!conductorData[conductorType]) {
        // Fallback to simplified calculation
        totalImpedance = totalImpedance.add(new Complex(remainingDistance * 0.5, 0));
      } else {
        const conductor = conductorData[conductorType];
        const tempFactor = temperatureFactors[substation.temperature || 75] || 1.0;
        
        const resistance = conductor.resistance * remainingDistance * tempFactor;
        const reactance = conductor.reactance * remainingDistance;
        
        totalImpedance = totalImpedance.add(new Complex(resistance, reactance));
      }
      break;
    } else {
      // Add full section impedance
      if (!conductorData[conductorType]) {
        totalImpedance = totalImpedance.add(new Complex(sectionDistance * 0.5, 0));
      } else {
        const conductor = conductorData[conductorType];
        const tempFactor = temperatureFactors[substation.temperature || 75] || 1.0;
        
        const resistance = conductor.resistance * sectionDistance * tempFactor;
        const reactance = conductor.reactance * sectionDistance;
        
        totalImpedance = totalImpedance.add(new Complex(resistance, reactance));
      }
      
      cumulativeDistance += sectionDistance;
    }
  }
  
  return totalImpedance;
};

// Calculate fault current at a specific distance
export const calculateFaultCurrentAtDistance = (devices, substation, distance, faultType = '3P') => {
  const impedance = calculateImpedanceAtPoint(devices, substation, distance);
  
  // Apply fault type multiplier
  const faultTypeMultipliers = {
    '3P': 1.0,      // Three-phase fault
    'SLG': 1.0,     // Single-line-to-ground (full fault current)
    'L-L': 0.866    // Line-to-line (87% of three-phase)
  };
  
  const multiplier = faultTypeMultipliers[faultType] || 1.0;
  
  // Calculate fault current using voltage drop method
  const systemVoltage = substation.nominalVoltage * 1000; // Convert kV to V
  const impedanceMagnitude = impedance.magnitude();
  
  if (impedanceMagnitude === 0) {
    return substation.availableFaultCurrent;
  }
  
  const faultCurrent = (systemVoltage / impedanceMagnitude) * multiplier;
  
  return Math.max(faultCurrent, substation.availableFaultCurrent * 0.1); // Minimum 10% of source current
};

// Find the nearest device to a given distance
export const findNearestDevice = (devices, targetDistance) => {
  const devicesWithCumulativeDistances = calculateCumulativeDistances(devices);
  const sortedDevices = devicesWithCumulativeDistances.sort((a, b) => a.cumulativeDistance - b.cumulativeDistance);
  
  let nearestDevice = null;
  let minDistance = Infinity;
  
  for (const device of sortedDevices) {
    const distanceDiff = Math.abs(device.cumulativeDistance - targetDistance);
    if (distanceDiff < minDistance) {
      minDistance = distanceDiff;
      nearestDevice = device;
    }
  }
  
  return nearestDevice;
};

// Main fault location estimation function
export const estimateFaultLocationAdvanced = (devices, substation, measuredFaultCurrent, faultType = '3P', vSource = null) => {
  if (devices.length === 0) {
    return {
      estimatedDistance: 0,
      nearestDevice: null,
      faultPointImpedance: new Complex(0, 0),
      confidence: 'low',
      error: 'No devices in feeder model'
    };
  }
  
  // Use provided voltage source or default to substation nominal voltage
  const sourceVoltage = vSource || substation.nominalVoltage;
  
  // Get total feeder length
  const devicesWithCumulativeDistances = calculateCumulativeDistances(devices);
  const sortedDevices = devicesWithCumulativeDistances.sort((a, b) => a.cumulativeDistance - b.cumulativeDistance);
  const totalFeederLength = sortedDevices[sortedDevices.length - 1]?.cumulativeDistance || 0;
  
  // Search for fault location using binary search approach
  let left = 0;
  let right = totalFeederLength;
  let bestMatch = null;
  let bestError = Infinity;
  
  // Search with fine granularity
  const searchStep = Math.min(0.1, totalFeederLength / 100); // 0.1 mile steps or 100 points
  
  for (let distance = left; distance <= right; distance += searchStep) {
    const calculatedCurrent = calculateFaultCurrentAtDistance(devices, substation, distance, faultType);
    const error = Math.abs(calculatedCurrent - measuredFaultCurrent);
    
    if (error < bestError) {
      bestError = error;
      bestMatch = {
        distance: distance,
        calculatedCurrent: calculatedCurrent,
        impedance: calculateImpedanceAtPoint(devices, substation, distance)
      };
    }
  }
  
  if (!bestMatch) {
    return {
      estimatedDistance: 0,
      nearestDevice: null,
      faultPointImpedance: new Complex(0, 0),
      confidence: 'low',
      error: 'Could not estimate fault location'
    };
  }
  
  // Find nearest device
  const nearestDevice = findNearestDevice(devices, bestMatch.distance);
  
  // Calculate confidence based on error percentage
  const errorPercentage = (bestError / measuredFaultCurrent) * 100;
  let confidence = 'low';
  if (errorPercentage < 5) confidence = 'high';
  else if (errorPercentage < 15) confidence = 'medium';
  
  return {
    estimatedDistance: bestMatch.distance,
    nearestDevice: nearestDevice,
    faultPointImpedance: bestMatch.impedance,
    calculatedFaultCurrent: bestMatch.calculatedCurrent,
    errorPercentage: errorPercentage,
    confidence: confidence,
    totalFeederLength: totalFeederLength
  };
};

// Get fault type options
export const getFaultTypeOptions = () => [
  { value: '3P', label: 'Three-Phase' },
  { value: 'SLG', label: 'Single-Line-to-Ground' },
  { value: 'L-L', label: 'Line-to-Line' }
];

// Format distance for display
export const formatDistance = (distance) => {
  return `${distance.toFixed(1)} miles`;
};

// Format current for display
export const formatCurrent = (current) => {
  if (current >= 1000) {
    return `${(current / 1000).toFixed(1)} kA`;
  }
  return `${current.toFixed(0)} A`;
}; 