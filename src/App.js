import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp } from 'lucide-react';
import AudioPlayer from './components/AudioPlayer';

const ESV_API_TOKEN = 'fe762f3700c9280c59edc63e85687aad7454e436';
const GROQ_API_KEY = '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';

const Card = ({ className, children, ...props }) => (
  <div className={`bg-white shadow rounded-lg ${className}`} {...props}>{children}</div>
);

const CardContent = ({ className, children, ...props }) => (
  <div className={`p-4 ${className}`} {...props}>{children}</div>
);

const Alert = ({ className, children, ...props }) => (
  <div className={`p-4 bg-blue-100 text-blue-700 rounded-lg ${className}`} {...props}>{children}</div>
);

const AlertTitle = ({ className, children, ...props }) => (
  <h4 className={`font-bold mb-2 ${className}`} {...props}>{children}</h4>
);

const AlertDescription = ({ className, children, ...props }) => (
  <p className={className} {...props}>{children}</p>
);

const getBiblePassage = async (reference) => {
  try {
    const response = await axios.get(`https://api.esv.org/v3/passage/text/`, {
      params: {
        q: reference,
        'include-footnotes': false,
        'include-headings': false,
        'include-verse-numbers': true,
        'include-passage-references': false
      },
      headers: {
        'Authorization': `Token ${ESV_API_TOKEN}`,
      }
    });
    return response.data.passages[0];
  } catch (error) {
    console.error('Error fetching Bible passage:', error);
    return null;
  }
};

const getGroqResponse = async (topic) => {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        messages: [
          {
            role: "system",
            content: "You are a Bible scholar acting as a topic Bible. You will be given a Bible topic. Your task is to give all the relevant Bible verses for that topic in chonological order based on relevancy of the topic provided. You should only output Bible references and nothing else. The output format should be like the following example: `John1.1;Genesis1.1`. In the response if the book of the Bible you're referring to after the semicolon, please add it."
          },
          {
            role: "user",
            content: topic
          }
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.5,
        max_tokens: 500,
        top_p: 1,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching Groq response:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    return null;
  }
};

const bookNameToId = {
  'Genesis': 'gn', 'Exodus': 'ex', 'Leviticus': 'lv', 'Numbers': 'nm', 'Deuteronomy': 'dt',
  'Joshua': 'js', 'Judges': 'jud', 'Ruth': 'rt', '1 Samuel': '1sm', '2 Samuel': '2sm',
  '1 Kings': '1kgs', '2 Kings': '2kgs', '1 Chronicles': '1ch', '2 Chronicles': '2ch',
  'Ezra': 'ezr', 'Nehemiah': 'ne', 'Esther': 'et', 'Job': 'jb', 'Psalms': 'ps', 'Psalm': 'ps',
  'Proverbs': 'prv', 'Ecclesiastes': 'ec', 'Song of Solomon': 'so', 'Isaiah': 'is',
  'Jeremiah': 'jr', 'Lamentations': 'lm', 'Ezekiel': 'ez', 'Daniel': 'dn', 'Hosea': 'hs',
  'Joel': 'jl', 'Amos': 'am', 'Obadiah': 'ob', 'Jonah': 'jnh', 'Micah': 'mi',
  'Nahum': 'na', 'Habakkuk': 'hk', 'Zephaniah': 'zp', 'Haggai': 'hg', 'Zechariah': 'zc',
  'Malachi': 'ml', 'Matthew': 'mt', 'Mark': 'mk', 'Luke': 'lk', 'John': 'jo',
  'Acts': 'act', 'Romans': 'rm', '1 Corinthians': '1co', '2 Corinthians': '2co',
  'Galatians': 'gl', 'Ephesians': 'ep', 'Philippians': 'ph', 'Colossians': 'cl',
  '1 Thessalonians': '1ts', '2 Thessalonians': '2ts', '1 Timothy': '1tm', '2 Timothy': '2tm',
  'Titus': 'tt', 'Philemon': 'phm', 'Hebrews': 'hb', 'James': 'jm', '1 Peter': '1pe',
  '2 Peter': '2pe', '1 John': '1jo', '2 John': '2jo', '3 John': '3jo', 'Jude': 'jd',
  'Revelation': 're'
};

async function fetchArabicBibleVerses(reference) {
  reference = reference.trim().replace(/\.$/, '');
  let book, chapterAndVerse;
  if (/^[123]/.test(reference)) {
    const parts = reference.split(' ');
    book = parts.slice(0, 2).join(' ');
    chapterAndVerse = parts.slice(2).join(' ');
  } else {
    [book, chapterAndVerse] = reference.split(' ');
  }

  const [chapterVerse, endVerse] = chapterAndVerse.split('-');
  let [chapter, verse] = chapterVerse.split('.');

  const bookId = bookNameToId[book];
  if (!bookId) {
    throw new Error(`Unknown book: ${book}`);
  }

  const response = await axios.get(
    `https://raw.githubusercontent.com/maatheusgois/bible/main/versions/ar/svd/${bookId}/${bookId}.json`
  );
  
  const bookData = response.data;
  
  const chapterIndex = parseInt(chapter) - 1;
  const verseStart = parseInt(verse) - 1;
  const verseEnd = endVerse ? parseInt(endVerse) - 1 : verseStart;
  
  if (!bookData.chapters[chapterIndex]) {
    throw new Error(`Chapter ${chapter} not found in ${book}`);
  }
  
  const verses = bookData.chapters[chapterIndex].slice(verseStart, verseEnd + 1);
  
  return verses.map((verseText, index) => `[${verseStart + index + 1}] ${verseText}`).join(' ');
}

const getArabicTranslation = async (reference) => {
  try {
    const arabicVerses = await fetchArabicBibleVerses(reference);
    return arabicVerses;
  } catch (error) {
    console.error('Error fetching Arabic translation:', error);
    return `Arabic translation not available (${error.message})`;
  }
};

const App = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [bibleReferences, setBibleReferences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRepeating, setIsRepeating] = useState(false);
  const cardRefs = useRef([]);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audio]);

  useEffect(() => {
    if (isPlaying && cardRefs.current[currentIndex]) {
      cardRefs.current[currentIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentIndex, isPlaying]);

  const playAudio = (index) => {
    if (bibleReferences.length === 0 || index >= bibleReferences.length) {
      console.error('No Bible references available or invalid index');
      return;
    }

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    const newAudio = new Audio(`https://audio.esv.org/hw/mq/${bibleReferences[index].reference}.mp3`);
    newAudio.onended = () => {
      if (isRepeating) {
        newAudio.currentTime = 0;
        newAudio.play().catch(error => {
          console.error('Error replaying audio:', error);
          setError('Failed to replay audio. Please try again.');
        });
      } else if (index < bibleReferences.length - 1) {
        setCurrentIndex(index + 1);
        playAudio(index + 1);
      } else {
        setIsPlaying(false);
      }
    };
    newAudio.play().catch(error => {
      console.error('Error playing audio:', error);
      setError('Failed to play audio. Please try again.');
    });
    setAudio(newAudio);
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (bibleReferences.length === 0) {
      setError('No Bible references available. Please search for a topic first.');
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      playAudio(currentIndex);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      playAudio(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < bibleReferences.length - 1) {
      playAudio(currentIndex + 1);
    }
  };

  const handleRepeat = () => {
    setIsRepeating(!isRepeating);
    if (audio) {
      audio.loop = !isRepeating;
    }
  };

  const handleSearch = async (topic) => {
    setIsLoading(true);
    setError(null);
    try {
      const groqResponse = await getGroqResponse(topic);
      console.log('Groq response:', groqResponse);
      if (groqResponse) {
        const references = groqResponse.split(';');
        const newReferences = await Promise.all(
          references.map(async (ref) => {
            console.log('Processing reference:', ref);
            try {
              const passage = await getBiblePassage(ref);
              const arabicPassage = await getArabicTranslation(ref);
              console.log('Arabic passage:', arabicPassage);
              return { 
                reference: ref, 
                passage: passage || 'Passage not available',
                arabicPassage: arabicPassage,
                duration: '~30s',
                isLoading: false
              };
            } catch (error) {
              console.error('Error processing reference:', ref, error);
              return {
                reference: ref,
                passage: 'Passage not available',
                arabicPassage: 'Arabic translation not available',
                duration: '~30s',
                isLoading: false,
                error: error.message
              };
            }
          })
        );
        console.log('New references:', newReferences);
        setBibleReferences(newReferences);
        setCurrentIndex(0);
        setIsRepeating(false);
        if (audio) {
          audio.loop = false;
        }
      } else {
        setError('Failed to fetch Bible references. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleSearch:', error);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
      <Alert className="my-6 bg-secondary text-secondary-foreground">
        <AlertTitle className="font-semibold">Welcome!</AlertTitle>
        <AlertDescription>
          Enter a Bible topic to explore relevant verses. Click on a reference to play that specific verse, or use the expand icon to read the passage.
        </AlertDescription>
      </Alert>
      {error && (
        <Alert className="my-6 bg-red-100 text-red-700">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading Bible references...</p>
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

const BibleReferenceCard = React.forwardRef(({ reference, duration, isActive, passage, arabicPassage, onClick, isLoading, error }, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const renderArabicPassage = (text) => {
    return text.split(/\[(\d+)\]/).map((part, index) => {
      if (index % 2 === 1) {
        return <sup key={index} className="text-xs text-muted-foreground mr-1">{part}</sup>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <Card 
      className={`mb-4 ${isActive ? 'ring-2 ring-primary ring-opacity-50' : ''} transition-all duration-300 ease-in-out hover:shadow-md`}
      ref={ref}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-primary">{reference}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">{duration}</span>
            <button 
              onClick={handleExpand}
              className="p-1 hover:bg-secondary rounded-full transition-colors duration-200"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-primary" />
              ) : (
                <ChevronDown className="h-4 w-4 text-primary" />
              )}
            </button>
          </div>
        </div>
        {(isActive || isExpanded) && (
          <div className="mt-4 space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : error ? (
              <p className="text-destructive">{error}</p>
            ) : (
              <>
                <div className="text-sm">
                  <h3 className="font-semibold mb-2 text-primary">Read Along</h3>
                  <p className="whitespace-pre-wrap text-foreground">{passage}</p>
                </div>
                <div className="text-sm">
                  <h3 className="font-semibold mb-2 text-primary">Van Dyke Arabic</h3>
                  <p className="whitespace-pre-wrap leading-relaxed text-foreground" dir="rtl" lang="ar">
                    {arabicPassage ? renderArabicPassage(arabicPassage) : 'Arabic translation not available'}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default App;
