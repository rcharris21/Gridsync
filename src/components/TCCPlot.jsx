import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { generateCurveData, calculateFaultCurrentAtDevice, calculateCumulativeDistances } from '../utils/engineeringUtils';
import { curveLibrary } from '../data/curveLibrary';
import FeederOneLineDiagram from './FeederOneLineDiagram';

const TCCPlot = ({ substation, devices, warnings = [], faultLocation = null }) => {
  const plotRef = useRef(null);

  useEffect(() => {
    if (!plotRef.current) return;

    const traces = [];
    const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

    // Generate curve data for each device
    devices.forEach((device, index) => {
      const curveData = generateCurveData(device);
      if (curveData) {
        traces.push({
          ...curveData,
          line: { 
            ...curveData.line, 
            color: colors[index % colors.length] 
          },
          marker: { 
            ...curveData.marker, 
            color: colors[index % colors.length] 
          }
        });
      }
    });

    // Add fault current markers using cumulative distance calculation
    const devicesWithCumulativeDistances = calculateCumulativeDistances(devices);
    const sortedDevices = devicesWithCumulativeDistances.sort((a, b) => a.cumulativeDistance - b.cumulativeDistance);
    
    sortedDevices.forEach((device, index) => {
      const faultCurrent = calculateFaultCurrentAtDevice(sortedDevices, substation, index);
      
      // Calculate operating time for the fault current marker
      const curve = curveLibrary[device.curveType];
      if (curve) {
        const curvePoints = curve.curve;
        let operatingTime = null;
        
        // Find the two points that bracket the current
        for (let i = 0; i < curvePoints.length - 1; i++) {
          if (curvePoints[i][0] <= faultCurrent && curvePoints[i + 1][0] >= faultCurrent) {
            const [lowerCurrent, lowerTime] = curvePoints[i];
            const [upperCurrent, upperTime] = curvePoints[i + 1];
            
            // Linear interpolation
            operatingTime = lowerTime + (upperTime - lowerTime) * (faultCurrent - lowerCurrent) / (upperCurrent - lowerCurrent);
            
            // Apply time dial if applicable
            if (device.timeDial && device.deviceType === 'recloser') {
              operatingTime *= device.timeDial;
            }
            break;
          }
        }
        
        if (operatingTime) {
          traces.push({
            x: [faultCurrent],
            y: [operatingTime],
            name: `${device.name} Fault Current`,
            type: 'scatter',
            mode: 'markers',
            marker: {
              symbol: 'diamond',
              size: 12,
              color: colors[index % colors.length],
              line: { width: 2, color: 'white' }
            },
            showlegend: false
          });
        }
      }
    });

    const layout = {
      title: {
        text: 'Time-Current Coordination (TCC) Plot',
        font: { size: 16 }
      },
      xaxis: {
        title: {
          text: 'Current (Amperes)',
          font: { size: 14, color: '#374151' },
          standoff: 20
        },
        type: 'log',
        range: [1, 4], // 10^1 to 10^4 = 10A to 10kA
        gridcolor: '#e5e7eb',
        zeroline: false,
        tickfont: { size: 12, color: '#6b7280' },
        tickformat: '.0f',
        tickprefix: '10^'
      },
      yaxis: {
        title: {
          text: 'Operating Time (seconds)',
          font: { size: 14, color: '#374151' },
          standoff: 20
        },
        type: 'log',
        range: [-2, 2], // 10^-2 to 10^2 = 0.01s to 100s
        gridcolor: '#e5e7eb',
        zeroline: false,
        tickfont: { size: 12, color: '#6b7280' },
        tickformat: '.2f'
      },
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      font: { color: '#374151' },
      margin: { l: 60, r: 30, t: 60, b: 60 },
      hovermode: 'closest',
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(255,255,255,0.8)',
        bordercolor: '#e5e7eb',
        borderwidth: 1
      }
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      displaylogo: false
    };

    Plotly.newPlot(plotRef.current, traces, layout, config);

    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, [devices, substation]);

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-100">Time-Current Coordination Plot</h2>
                 <p className="text-sm text-gray-400">
           Log-log plot showing device curves and estimated fault currents
         </p>
      </div>
      
      <div 
        ref={plotRef} 
        className="w-full h-96"
        style={{ minHeight: '400px' }}
      />
      
      {devices.length === 0 && (
                 <div className="flex items-center justify-center h-64 text-gray-400">
           <div className="text-center">
             <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Add protection devices to see the TCC plot</p>
          </div>
        </div>
      )}
      
      {/* Feeder One-Line Diagram */}
      {devices.length > 0 && (
        <FeederOneLineDiagram 
          devices={devices}
          substation={substation}
          faultLocation={faultLocation}
          miscoordinatedDevices={warnings.map(w => w.deviceId).filter(Boolean)}
        />
      )}
    </div>
  );
};

export default TCCPlot; 