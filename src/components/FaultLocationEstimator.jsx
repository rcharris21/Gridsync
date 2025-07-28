import React, { useState } from 'react';
import { 
  estimateFaultLocationAdvanced, 
  getFaultTypeOptions, 
  formatDistance, 
  formatCurrent 
} from '../utils/faultLocationEstimator';

const FaultLocationEstimator = ({ devices, substation }) => {
  const [measuredCurrent, setMeasuredCurrent] = useState('');
  const [faultType, setFaultType] = useState('3P');
  const [measurementLocation, setMeasurementLocation] = useState('');
  const [useExactImpedance, setUseExactImpedance] = useState(true);
  const [estimationResults, setEstimationResults] = useState(null);

  const faultTypeOptions = getFaultTypeOptions();

  const handleEstimate = () => {
    if (!measuredCurrent || devices.length === 0) return;
    
    const inputValue = parseFloat(measuredCurrent);
    if (isNaN(inputValue) || inputValue <= 0) return;
    
    const results = estimateFaultLocationAdvanced(
      devices, 
      substation, 
      inputValue, 
      faultType
    );
    setEstimationResults(results);
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceIcon = (confidence) => {
    switch (confidence) {
      case 'high':
        return '✅';
      case 'medium':
        return '⚠️';
      case 'low':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className="card">
             <h2 className="text-lg font-semibold text-gray-100 mb-4">Fault Location Estimator</h2>
      
      {/* Input Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Measured Fault Current (A) *
          </label>
          <input
            type="number"
            value={measuredCurrent}
            onChange={(e) => setMeasuredCurrent(e.target.value)}
            placeholder="e.g., 2500"
            className="input-field"
            step="1"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the fault current measured by relay, recloser, or other protection device
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Fault Type</label>
          <select 
            value={faultType} 
            onChange={(e) => setFaultType(e.target.value)}
            className="input-field"
          >
            {faultTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Measurement Location (Optional)
          </label>
          <input
            type="text"
            value={measurementLocation}
            onChange={(e) => setMeasurementLocation(e.target.value)}
            placeholder="e.g., Recloser R1, Substation"
            className="input-field"
          />
          <p className="text-xs text-gray-500 mt-1">
            Where the fault current was measured (for reference)
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="useExactImpedance"
            checked={useExactImpedance}
            onChange={(e) => setUseExactImpedance(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="useExactImpedance" className="text-sm text-gray-200">
            Use exact feeder impedance model
          </label>
        </div>

        <button
          onClick={handleEstimate}
          disabled={!measuredCurrent || devices.length === 0}
          className="btn-primary w-full"
        >
          Estimate Fault Location
        </button>
      </div>

      {/* Results */}
      {estimationResults && (
        <div className="space-y-4">
          {estimationResults.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{estimationResults.error}</p>
            </div>
          ) : (
            <>
              {/* Main Results */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-3">Fault Location Estimate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Estimated Distance:</span>
                    <p className="text-blue-900 text-lg font-semibold">
                      {formatDistance(estimationResults.estimatedDistance)}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Nearest Device:</span>
                    <p className="text-blue-900 text-lg font-semibold">
                      {estimationResults.nearestDevice?.name || 'None'}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Calculated Current:</span>
                    <p className="text-blue-900">
                      {formatCurrent(estimationResults.calculatedFaultCurrent)}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Error:</span>
                    <p className="text-blue-900">
                      {estimationResults.errorPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Confidence Indicator */}
              <div className={`border rounded-lg p-4 ${getConfidenceColor(estimationResults.confidence)}`}>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getConfidenceIcon(estimationResults.confidence)}</span>
                  <div>
                    <p className="font-medium">
                      Confidence: {estimationResults.confidence.charAt(0).toUpperCase() + estimationResults.confidence.slice(1)}
                    </p>
                    <p className="text-xs mt-1">
                      {estimationResults.confidence === 'high' && 'High confidence - fault location estimate is reliable'}
                      {estimationResults.confidence === 'medium' && 'Medium confidence - consider additional factors'}
                      {estimationResults.confidence === 'low' && 'Low confidence - verify feeder model and measurements'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-100 mb-2">Technical Details</h3>
                <div className="space-y-2 text-xs text-gray-700">
                  <div>
                    <span className="font-medium">Fault Point Impedance:</span> {estimationResults.faultPointImpedance.toString()} Ω
                  </div>
                  <div>
                    <span className="font-medium">Total Feeder Length:</span> {formatDistance(estimationResults.totalFeederLength)}
                  </div>
                  <div>
                    <span className="font-medium">Fault Type:</span> {faultTypeOptions.find(opt => opt.value === faultType)?.label}
                  </div>
                  {measurementLocation && (
                    <div>
                      <span className="font-medium">Measurement Location:</span> {measurementLocation}
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-900 mb-2">Recommendations</h3>
                <ul className="text-xs text-yellow-800 space-y-1">
                  <li>• Verify the estimated location with field inspection</li>
                  <li>• Check for any recent construction or changes in the feeder</li>
                  <li>• Confirm conductor types and distances in the model</li>
                  <li>• Consider using fault indicators or other location methods</li>
                </ul>
              </div>
            </>
          )}
        </div>
      )}

      {devices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Add protection devices to enable fault location estimation.</p>
        </div>
      )}
    </div>
  );
};

export default FaultLocationEstimator; 