import React, { useState } from 'react';

const TabbedInterface = ({ children, tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="card">
      {/* Tab Navigation */}
      <div className="border-b border-gray-700 mb-4">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === index
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }
              `}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {children[activeTab]}
      </div>
    </div>
  );
};

export default TabbedInterface; 