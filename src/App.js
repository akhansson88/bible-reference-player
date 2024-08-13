import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp } from 'lucide-react';
import AudioPlayer from './components/AudioPlayer';

// Keep your existing constants (ESV_API_TOKEN, GROQ_API_KEY, etc.)

// Keep your existing utility functions (getBiblePassage, getGroqResponse, bookNameToId, fetchArabicBibleVerses, getArabicTranslation)

const App = () => {
  // Keep your existing state variables and useEffect hooks

  // Keep your existing functions (playAudio, handlePlayPause, handlePrevious, handleNext, handleRepeat, handleSearch)

  return (
    <div className="max-w-md mx-auto p-4 bg-background">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">Growing in Prayer</h1>
      <AudioPlayer
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSearch={handleSearch}
        onRepeat={handleRepeat}
        isRepeating={isRepeating}
      />
      <div className="my-6 bg-blue-100 text-blue-700 rounded-lg p-4">
        <h4 className="font-bold mb-2">Welcome!</h4>
        <p>
          Enter a Bible topic to explore relevant verses. Click on a reference to play that specific verse, or use the expand icon to read the passage.
        </p>
      </div>
      {error && (
        <div className="my-6 bg-red-100 text-red-700 rounded-lg p-4">
          <h4 className="font-bold mb-2">Error</h4>
          <p>{error}</p>
        </div>
      )}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading Bible references...</p>
      ) : (
        bibleReferences.map((item, index) => (
          <BibleReferenceCard
            key={index}
            reference={item.reference}
            duration={item.duration}
            isActive={index === currentIndex && isPlaying}
            passage={item.passage}
            arabicPassage={item.arabicPassage}
            onClick={() => playAudio(index)}
            ref={el => cardRefs.current[index] = el}
          />
        ))
      )}
    </div>
  );
};

const BibleReferenceCard = React.forwardRef(({ reference, duration, isActive, passage, arabicPassage, onClick }, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const renderArabicPassage = (text) => {
    return text.split(/\[(\d+)\]/).map((part, index) => {
      if (index % 2 === 1) {
        return <sup key={index} className="text-xs text-gray-500 mr-1">{part}</sup>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div 
      className={`mb-4 bg-white shadow rounded-lg ${isActive ? 'ring-2 ring-blue-500 ring-opacity-50' : ''} transition-all duration-300 ease-in-out hover:shadow-md`}
      ref={ref}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-blue-600">{reference}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{duration}</span>
            <button 
              onClick={handleExpand}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-blue-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-blue-500" />
              )}
            </button>
          </div>
        </div>
        {(isActive || isExpanded) && (
          <div className="mt-4 space-y-4">
            <div className="text-sm">
              <h3 className="font-semibold mb-2 text-blue-600">Read Along</h3>
              <p className="whitespace-pre-wrap">{passage}</p>
            </div>
            <div className="text-sm">
              <h3 className="font-semibold mb-2 text-blue-600">Van Dyke Arabic</h3>
              <p className="whitespace-pre-wrap leading-relaxed" dir="rtl" lang="ar">
                {arabicPassage ? renderArabicPassage(arabicPassage) : 'Arabic translation not available'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default App;
