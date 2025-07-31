// Conductor impedance data from IEEE standards
// Values are in ohms per mile at 75°C
export const conductorData = {
  // ACSR (Aluminum Conductor Steel Reinforced) - Most common
  "ACSR #2": {
    type: "ACSR",
    size: "#2",
    resistance: 1.12, // ohms/mile
    reactance: 0.53,  // ohms/mile
    ampacity: 190,    // amps
    description: "#2 ACSR - Small distribution"
  },
  "ACSR 1/0": {
    type: "ACSR",
    size: "1/0",
    resistance: 0.97, // ohms/mile
    reactance: 0.52,  // ohms/mile
    ampacity: 205,    // amps
    description: "1/0 ACSR - Common for distribution"
  },
  "ACSR 2/0": {
    type: "ACSR",
    size: "2/0", 
    resistance: 0.76,
    reactance: 0.51,
    ampacity: 230,
    description: "2/0 ACSR - Medium distribution"
  },
  "ACSR 4/0": {
    type: "ACSR",
    size: "4/0",
    resistance: 0.48,
    reactance: 0.49,
    ampacity: 280,
    description: "4/0 ACSR - Heavy distribution"
  },
  "ACSR 266.8": {
    type: "ACSR",
    size: "266.8",
    resistance: 0.36,
    reactance: 0.47,
    ampacity: 340,
    description: "266.8 ACSR - Large distribution"
  },
  "ACSR 336.4": {
    type: "ACSR", 
    size: "336.4",
    resistance: 0.29,
    reactance: 0.46,
    ampacity: 380,
    description: "336.4 ACSR - Subtransmission"
  },
  "ACSR 397": {
    type: "ACSR",
    size: "397",
    resistance: 0.24,
    reactance: 0.45,
    ampacity: 420,
    description: "397 ACSR - Subtransmission"
  },
  "ACSR 477": {
    type: "ACSR",
    size: "477",
    resistance: 0.20,
    reactance: 0.44,
    ampacity: 450,
    description: "477 ACSR - Subtransmission"
  },
  "ACSR 636": {
    type: "ACSR",
    size: "636", 
    resistance: 0.15,
    reactance: 0.43,
    ampacity: 520,
    description: "636 ACSR - Transmission"
  },
  "ACSR 795": {
    type: "ACSR",
    size: "795",
    resistance: 0.12,
    reactance: 0.42,
    ampacity: 590,
    description: "795 ACSR - Heavy transmission"
  },

  // AAAC (All Aluminum Alloy Conductor)
  "AAAC 1/0": {
    type: "AAAC",
    size: "1/0",
    resistance: 0.97,
    reactance: 0.52,
    ampacity: 205,
    description: "1/0 AAAC - Distribution"
  },
  "AAAC 2/0": {
    type: "AAAC", 
    size: "2/0",
    resistance: 0.76,
    reactance: 0.51,
    ampacity: 230,
    description: "2/0 AAAC - Distribution"
  },
  "AAAC 4/0": {
    type: "AAAC",
    size: "4/0",
    resistance: 0.48,
    reactance: 0.49,
    ampacity: 280,
    description: "4/0 AAAC - Distribution"
  },

  // AAC (All Aluminum Conductor)
  "AAC 1/0": {
    type: "AAC",
    size: "1/0",
    resistance: 1.12,
    reactance: 0.52,
    ampacity: 180,
    description: "1/0 AAC - Distribution"
  },
  "AAC 2/0": {
    type: "AAC",
    size: "2/0", 
    resistance: 0.89,
    reactance: 0.51,
    ampacity: 205,
    description: "2/0 AAC - Distribution"
  },
  "AAC 4/0": {
    type: "AAC",
    size: "4/0",
    resistance: 0.56,
    reactance: 0.49,
    ampacity: 250,
    description: "4/0 AAC - Distribution"
  },

  // Copper (less common but still used)
  "Copper 1/0": {
    type: "Copper",
    size: "1/0",
    resistance: 0.69,
    reactance: 0.52,
    ampacity: 230,
    description: "1/0 Copper - Distribution"
  },
  "Copper 2/0": {
    type: "Copper",
    size: "2/0",
    resistance: 0.55,
    reactance: 0.51,
    ampacity: 260,
    description: "2/0 Copper - Distribution"
  },
  "Copper 4/0": {
    type: "Copper",
    size: "4/0",
    resistance: 0.35,
    reactance: 0.49,
    ampacity: 310,
    description: "4/0 Copper - Distribution"
  }
};

// Line configuration factors
export const lineConfigurations = {
  "Single Phase": {
    factor: 1.0,
    description: "Single phase line"
  },
  "Three Phase": {
    factor: 1.0,
    description: "Three phase line"
  },
  "Single Phase with Neutral": {
    factor: 1.0,
    description: "Single phase with neutral return"
  },
  "Three Phase with Neutral": {
    factor: 1.0,
    description: "Three phase with neutral return"
  }
};

// Temperature correction factors
export const temperatureFactors = {
  25: 1.0,   // 25°C - no correction
  50: 1.08,  // 50°C
  75: 1.16,  // 75°C - standard rating
  90: 1.24   // 90°C
};

// Get conductor options for dropdown
export const getConductorOptions = () => {
  return Object.keys(conductorData).map(name => ({
    value: name,
    label: name,
    type: conductorData[name].type,
    size: conductorData[name].size
  }));
};

// Get conductors by type
export const getConductorsByType = (type) => {
  return Object.keys(conductorData)
    .filter(name => conductorData[name].type === type)
    .map(name => ({
      value: name,
      label: name
    }));
}; 