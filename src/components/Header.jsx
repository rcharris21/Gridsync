import React from 'react';

const Header = ({ onNewStudy, onSaveStudy, onLoadStudy }) => {
  return (
           <header className="bg-gray-800 shadow-lg border-b border-gray-700">
         <div className="container mx-auto px-4 py-4">
           <div className="flex items-center justify-between">
             {/* Logo and Title */}
             <div className="flex items-center space-x-3">
               <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                 <svg className="w-5 h-5 text-lime-400" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"/>
                 </svg>
               </div>
               <div>
                 <h1 className="text-xl font-bold text-gray-100">GridSync</h1>
                 <p className="text-sm text-gray-400">Protection Coordination Studies</p>
               </div>
             </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onNewStudy}
              className="btn-secondary"
            >
              New Study
            </button>
            
            <button
              onClick={onSaveStudy}
              className="btn-primary"
            >
              Save Study
            </button>
            
            <label className="btn-secondary cursor-pointer">
              Load Study
              <input
                type="file"
                accept=".json"
                onChange={onLoadStudy}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 