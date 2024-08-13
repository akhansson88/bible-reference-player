import React from 'react';
import { Button } from "../components/ui/button"
import { Play, Pause, SkipBack, SkipForward, Search, Repeat } from 'lucide-react';
import { Input } from "../components/ui/Input"

const AudioPlayer = ({ isPlaying, onPlayPause, onPrevious, onNext, onSearch, onRepeat, isRepeating }) => {
  const [topic, setTopic] = React.useState('');

  const handleSearch = () => {
    onSearch(topic);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFocus = (event) => {
    event.target.setAttribute('readonly', 'readonly');
    setTimeout(() => {
      event.target.removeAttribute('readonly');
    }, 100);
  };

  return (
    <div className="sticky top-0 z-10 w-full bg-background shadow-md">
      <div className="max-w-md mx-auto flex flex-col items-center space-y-4 p-4">
        <div className="w-full flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Provide a Bible topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            className="bg-secondary text-secondary-foreground placeholder-muted-foreground"
            style={{ fontSize: '16px' }}
          />
          <Button onClick={handleSearch} variant="outline" size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-center items-center space-x-4">
          <Button onClick={onPrevious} variant="outline" size="icon" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button onClick={onPlayPause} variant="outline" size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button onClick={onNext} variant="outline" size="icon" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button 
            onClick={onRepeat} 
            variant="outline" 
            size="icon" 
            className={`${isRepeating ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"} hover:bg-accent/90`}
          >
            <Repeat className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;