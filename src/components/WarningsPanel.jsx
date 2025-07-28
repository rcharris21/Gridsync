import React from 'react';

const WarningsPanel = ({ warnings }) => {
  const getWarningIcon = (severity) => {
    switch (severity) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return 'ℹ️';
    }
  };

  const getWarningColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getWarningTextColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-800';
      case 'medium':
        return 'text-yellow-800';
      case 'low':
        return 'text-green-800';
      default:
        return 'text-blue-800';
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'time_dial':
        return '⚙️';
      case 'curve_selection':
        return '📈';
      case 'fuse_upgrade':
        return '🔧';
      case 'tripsaver_settings':
        return '⚡';
      case 'margin_increase':
        return '⏱️';
      default:
        return '💡';
    }
  };

  return (
    <div className="card">
             <h2 className="text-lg font-semibold text-gray-100 mb-4">Coordination Analysis</h2>
      
      {/* Disclaimer */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <span className="text-blue-600 text-sm">ℹ️</span>
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Engineering Disclaimer:</p>
            <p>All recommendations are based on typical utility engineering practices but should be verified by qualified engineers. Always double-check settings against manufacturer specifications and local utility standards.</p>
          </div>
        </div>
      </div>
      
      {warnings.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-800 font-medium">No coordination issues detected</p>
          <p className="text-sm text-gray-600 mt-1">
            All devices appear to be properly coordinated
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getWarningColor(warning.severity)}`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg">{getWarningIcon(warning.severity)}</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${getWarningTextColor(warning.severity)}`}>
                    {warning.message}
                  </p>
                  {warning.faultCurrent && (
                    <p className="text-xs text-gray-600 mt-1">
                      Fault current: {(warning.faultCurrent / 1000).toFixed(1)} kA
                    </p>
                  )}
                  
                  {/* Specific Recommendations */}
                  {warning.recommendations && warning.recommendations.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Specific Recommendations:</p>
                      <div className="space-y-2">
                        {warning.recommendations.map((rec, recIndex) => (
                          <div key={recIndex} className="flex items-start space-x-2">
                            <span className="text-sm">{getRecommendationIcon(rec.type)}</span>
                            <p className="text-xs text-gray-700 flex-1">{rec.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {warnings.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-100 mb-2">General Best Practices:</h3>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• Maintain minimum 0.2-0.3 second coordination margins</li>
            <li>• Upstream devices should operate before downstream devices</li>
            <li>• Consider load current when setting pickup values</li>
            <li>• Verify settings against manufacturer specifications</li>
            <li>• Test coordination under various fault conditions</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default WarningsPanel; 