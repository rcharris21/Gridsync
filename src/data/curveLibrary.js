export const curveLibrary = {
  // IEEE Standard Recloser Curves
  "IEEE C": {
    type: "recloser",
    curve: [[200, 0.05], [500, 0.1], [1000, 0.4], [2000, 1.2], [5000, 4.0], [10000, 8.0]]
  },
  "IEEE D": {
    type: "recloser",
    curve: [[200, 0.02], [500, 0.05], [1000, 0.2], [2000, 0.6], [5000, 2.0], [10000, 4.0]]
  },
  "IEEE E": {
    type: "recloser", 
    curve: [[200, 0.01], [500, 0.025], [1000, 0.1], [2000, 0.3], [5000, 1.0], [10000, 2.0]]
  },
  "IEEE F": {
    type: "recloser",
    curve: [[200, 0.005], [500, 0.0125], [1000, 0.05], [2000, 0.15], [5000, 0.5], [10000, 1.0]]
  },
  
  // ANSI/IEEE Standard Inverse Curves
  "ANSI Extremely Inverse": {
    type: "recloser",
    curve: [[200, 0.008], [500, 0.02], [1000, 0.08], [2000, 0.24], [5000, 0.8], [10000, 1.6]]
  },
  "ANSI Very Inverse": {
    type: "recloser",
    curve: [[200, 0.015], [500, 0.0375], [1000, 0.15], [2000, 0.45], [5000, 1.5], [10000, 3.0]]
  },
  "ANSI Inverse": {
    type: "recloser",
    curve: [[200, 0.03], [500, 0.075], [1000, 0.3], [2000, 0.9], [5000, 3.0], [10000, 6.0]]
  },
  "ANSI Moderately Inverse": {
    type: "recloser",
    curve: [[200, 0.06], [500, 0.15], [1000, 0.6], [2000, 1.8], [5000, 6.0], [10000, 12.0]]
  },
  
  // S&C Fuse Curves (Industry Standard)
  "S&C K-25": {
    type: "fuse",
    curve: [[50, 0.1], [100, 0.2], [200, 0.5], [500, 2.0], [1000, 8.0], [2000, 20.0]]
  },
  "S&C K-50": {
    type: "fuse",
    curve: [[100, 0.1], [200, 0.2], [500, 0.5], [1000, 2.2], [2000, 8.0], [5000, 12.5]]
  },
  "S&C K-100": {
    type: "fuse", 
    curve: [[200, 0.1], [500, 0.3], [1000, 1.0], [2000, 3.5], [5000, 8.0], [10000, 15.0]]
  },
  "S&C K-200": {
    type: "fuse",
    curve: [[500, 0.1], [1000, 0.4], [2000, 1.2], [5000, 3.0], [10000, 6.0], [20000, 12.0]]
  },
  "S&C K-400": {
    type: "fuse",
    curve: [[1000, 0.1], [2000, 0.4], [5000, 1.2], [10000, 3.0], [20000, 6.0], [40000, 12.0]]
  },
  
  // Cooper Power Systems Fuse Curves
  "Cooper K-25": {
    type: "fuse",
    curve: [[50, 0.1], [100, 0.2], [200, 0.5], [500, 2.0], [1000, 8.0], [2000, 20.0]]
  },
  "Cooper K-50": {
    type: "fuse",
    curve: [[100, 0.1], [200, 0.2], [500, 0.5], [1000, 2.2], [2000, 8.0], [5000, 12.5]]
  },
  "Cooper K-100": {
    type: "fuse",
    curve: [[200, 0.1], [500, 0.3], [1000, 1.0], [2000, 3.5], [5000, 8.0], [10000, 15.0]]
  },
  
  // TripSaver Curves (S&C)
  "TripSaver 25A": {
    type: "tripsaver",
    curve: [[50, 0.05], [100, 0.1], [200, 0.3], [500, 1.0], [1000, 3.0], [2000, 8.0]]
  },
  "TripSaver 50A": {
    type: "tripsaver",
    curve: [[100, 0.05], [200, 0.1], [500, 0.3], [1000, 1.0], [2000, 3.0], [5000, 8.0]]
  },
  "TripSaver 100A": {
    type: "tripsaver",
    curve: [[200, 0.05], [500, 0.15], [1000, 0.5], [2000, 1.5], [5000, 4.0], [10000, 8.0]]
  },
  "TripSaver 200A": {
    type: "tripsaver",
    curve: [[500, 0.05], [1000, 0.2], [2000, 0.6], [5000, 1.8], [10000, 4.0], [20000, 8.0]]
  },
  
  // SEL Relay Curves (Common in Modern Systems)
  "SEL IEEE C": {
    type: "recloser",
    curve: [[200, 0.05], [500, 0.1], [1000, 0.4], [2000, 1.2], [5000, 4.0], [10000, 8.0]]
  },
  "SEL IEEE D": {
    type: "recloser",
    curve: [[200, 0.02], [500, 0.05], [1000, 0.2], [2000, 0.6], [5000, 2.0], [10000, 4.0]]
  },
  "SEL IEEE E": {
    type: "recloser", 
    curve: [[200, 0.01], [500, 0.025], [1000, 0.1], [2000, 0.3], [5000, 1.0], [10000, 2.0]]
  },
  
  // GE Relay Curves
  "GE IEEE C": {
    type: "recloser",
    curve: [[200, 0.05], [500, 0.1], [1000, 0.4], [2000, 1.2], [5000, 4.0], [10000, 8.0]]
  },
  "GE IEEE D": {
    type: "recloser",
    curve: [[200, 0.02], [500, 0.05], [1000, 0.2], [2000, 0.6], [5000, 2.0], [10000, 4.0]]
  },
  
  // Schweitzer Engineering Laboratories (SEL) Custom Curves
  "SEL Custom 1": {
    type: "recloser",
    curve: [[200, 0.03], [500, 0.075], [1000, 0.3], [2000, 0.9], [5000, 3.0], [10000, 6.0]]
  },
  "SEL Custom 2": {
    type: "recloser",
    curve: [[200, 0.04], [500, 0.1], [1000, 0.4], [2000, 1.2], [5000, 4.0], [10000, 8.0]]
  },
  
  // Distribution Class Fuses (Common in Rural Areas)
  "Distribution Class 25A": {
    type: "fuse",
    curve: [[50, 0.1], [100, 0.2], [200, 0.5], [500, 2.0], [1000, 8.0], [2000, 20.0]]
  },
  "Distribution Class 50A": {
    type: "fuse",
    curve: [[100, 0.1], [200, 0.2], [500, 0.5], [1000, 2.2], [2000, 8.0], [5000, 12.5]]
  },
  "Distribution Class 100A": {
    type: "fuse",
    curve: [[200, 0.1], [500, 0.3], [1000, 1.0], [2000, 3.5], [5000, 8.0], [10000, 15.0]]
  }
};

export const getCurveOptions = () => {
  return Object.keys(curveLibrary).map(name => ({
    value: name,
    label: name,
    type: curveLibrary[name].type
  }));
};

export const getCurveByType = (type) => {
  return Object.keys(curveLibrary)
    .filter(name => curveLibrary[name].type === type)
    .map(name => ({
      value: name,
      label: name
    }));
};

// Curve categories for better organization
export const curveCategories = {
  "IEEE Standard": ["IEEE C", "IEEE D", "IEEE E", "IEEE F"],
  "ANSI Standard": ["ANSI Extremely Inverse", "ANSI Very Inverse", "ANSI Inverse", "ANSI Moderately Inverse"],
  "S&C Fuses": ["S&C K-25", "S&C K-50", "S&C K-100", "S&C K-200", "S&C K-400"],
  "Cooper Fuses": ["Cooper K-25", "Cooper K-50", "Cooper K-100"],
  "TripSaver": ["TripSaver 25A", "TripSaver 50A", "TripSaver 100A", "TripSaver 200A"],
  "SEL Relays": ["SEL IEEE C", "SEL IEEE D", "SEL IEEE E", "SEL Custom 1", "SEL Custom 2"],
  "GE Relays": ["GE IEEE C", "GE IEEE D"],
  "Distribution Class": ["Distribution Class 25A", "Distribution Class 50A", "Distribution Class 100A"]
}; 