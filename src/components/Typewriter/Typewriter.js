import React, { useEffect, useState } from 'react';
import './Typewriter.css';

const Typewriter = ({ phrases, sleepTime = 100, startDelay = 2000 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const handleTyping = async () => {
      const currentPhrase = phrases[currentPhraseIndex];

      if (!isDeleting) {
        if (charIndex < currentPhrase.length) {
          setDisplayedText(currentPhrase.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          await sleep(sleepTime * 10);
          setIsDeleting(true);
        }
      } else {
        if (charIndex > 0) {
          setDisplayedText(currentPhrase.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setCurrentPhraseIndex((currentPhraseIndex + 1) % phrases.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? sleepTime / 2 : sleepTime);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phrases, currentPhraseIndex, sleepTime]);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setCharIndex(0);  // Start typing
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [startDelay]);

  return (
    <span>
      {displayedText}
      <span className="cursor">|</span>
    </span>
  );
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default Typewriter;
