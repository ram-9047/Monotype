import { useState, useEffect, useRef } from "react";
import { IoReload } from 'react-icons/io5';
import audioEngine from "./utils/audioEngine";
import "./app.scss";

import quotes from "./utils/quotes.json";

function App() {
  const [textToType, setTextToType] = useState(getRandomQuote());
  const textChunks = textToType.split(" ");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentTypedWord, setCurrentTypedWord] = useState("");
  const [results, setResults] = useState(null);
  const [typedWords, setTypedWords] = useState([]);
  
  // Ultimate 10/10 Overhaul States
  const [theme, setTheme] = useState("midnight");
  const [soundProfile, setSoundProfile] = useState("blue");
  const [liveStats, setLiveStats] = useState({ wpm: 0, accuracy: 100 });
  const quoteCardRef = useRef(null);

  // Update HTML data-theme attribute on state change
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // Refocus quote card after theme change to keep typing uninterrupted
    if (quoteCardRef && quoteCardRef.current) {
      quoteCardRef.current.focus();
    }
  }, [theme]);

  function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }



  // Additional state for typing engine
  const [startTime, setStartTime] = useState(null);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [pastCorrectChars, setPastCorrectChars] = useState(0);

  // Helper to compute live metrics (WPM & accuracy)
  function calculateLiveMetrics(currentInputText, currentWordIdx, totalKeys, pastCorrect) {
    if (!startTime) return { wpm: 0, accuracy: 100 };
    const elapsedSeconds = (new Date().getTime() - startTime) / 1000;
    const targetWord = textChunks[currentWordIdx] || "";
    const limit = Math.min(currentInputText.length, targetWord.length);
    let activeCorrect = 0;
    for (let i = 0; i < limit; i++) {
      if (currentInputText[i] === targetWord[i]) activeCorrect++;
    }
    const totalCorrect = pastCorrect + activeCorrect;
    const wpm = elapsedSeconds > 0.5 ? Math.round((totalCorrect / 5) / (elapsedSeconds / 60)) : 0;
    const accuracy = totalKeys > 0 ? Math.round((totalCorrect / totalKeys) * 100) : 100;
    return { wpm, accuracy };
  }

  // Main key handler attached to the quote card body
  function handleKeyDown(e) {
    const { key, code } = e;
    // Initialise start time on first keystroke
    if (!startTime) setStartTime(new Date().getTime());

    // ---- Space handling (move to next word) ----
    if (code === "Space") {
      e.preventDefault();
      const targetWord = textChunks[currentWordIndex] || "";

      // Move to next word only if the user has typed the full length of the current word
      if (currentTypedWord.length === targetWord.length) {
        const typed = currentTypedWord;
        let correctInWord = 0;
        for (let i = 0; i < Math.min(typed.length, targetWord.length); i++) {
          if (typed[i] === targetWord[i]) correctInWord++;
        }
        const newPastCorrect = pastCorrectChars + correctInWord;
        setPastCorrectChars(newPastCorrect);

        audioEngine.playClick(soundProfile);
        setTotalKeystrokes((prev) => {
          const newKeys = prev + 1; // space counts as a keystroke
          const { wpm, accuracy } = calculateLiveMetrics("", currentWordIndex + 1, newKeys, newPastCorrect);
          setLiveStats({ wpm, accuracy });
          return newKeys;
        });

        setTypedWords((prev) => [...prev, typed]);
        setCurrentTypedWord("");
        if (currentWordIndex < textChunks.length - 1) {
          setCurrentWordIndex((prev) => prev + 1);
        } else {
          // Finished the last word via space – compute final results
          handleFinished(typed);
        }
        return;
      }
      // If the current word is incomplete, Space falls through to be treated as a wrong character
    }

    // ---- Backspace handling ----
    if (key === "Backspace") {
      if (currentTypedWord.length === 0) return;
      setCurrentTypedWord((prev) => prev.slice(0, -1));
      audioEngine.playClick("red"); // tactile feedback
      // Do NOT increment totalKeystrokes for backspace
      return;
    }

    // ---- Printable characters ----
    if (key.length === 1) { // simple printable check
      const targetWord = textChunks[currentWordIndex] || "";
      if (currentTypedWord.length >= targetWord.length) return; // prevent overflow
      const newTyped = currentTypedWord + key;
      setCurrentTypedWord(newTyped);
      audioEngine.playClick(soundProfile);
      setTotalKeystrokes((prev) => {
        const newKeys = prev + 1;
        const { wpm, accuracy } = calculateLiveMetrics(newTyped, currentWordIndex, newKeys, pastCorrectChars);
        setLiveStats({ wpm, accuracy });
        return newKeys;
      });
    }
  }

  // Called when the test is completed (either via space on last word or manual finish)
  function handleFinished(finalWordText) {
    const rawTime = (new Date().getTime() - startTime) / 1000;
    const timeTaken = parseFloat(rawTime.toFixed(1));
    const totalWords = Math.round(textToType.length / 5);
    const wpm = Math.max(0, Math.round(totalWords / (rawTime / 60)));
    const cpm = Math.max(0, Math.round(textToType.length / (rawTime / 60)));

    // Compute accuracy for the final word
    const targetWord = textChunks[currentWordIndex] || "";
    let activeCorrect = 0;
    for (let i = 0; i < finalWordText.length; i++) {
      if (finalWordText[i] === targetWord[i]) activeCorrect++;
    }
    const finalCorrect = pastCorrectChars + activeCorrect;
    const finalAccuracy = totalKeystrokes > 0 ? Math.round((finalCorrect / (totalKeystrokes + 1)) * 100) : 100;

    setResults({
      words: totalWords,
      characters: textToType.length,
      time: timeTaken,
      wpm,
      cpm,
      accuracy: finalAccuracy,
    });
    // Reset for next round
    setStartTime(null);
    setTotalKeystrokes(0);
    setPastCorrectChars(0);
  }

  function refreshQuote() {
    setTextToType(getRandomQuote());
    setCurrentWordIndex(0);
    setCurrentTypedWord('');
    setResults(null);
    setLiveStats({ wpm: 0, accuracy: 100 });
    setTypedWords([]);
  }

  function renderTextToType() {
    return textToType.split(" ").map((word, wordIndex) => {
      const isActive = currentWordIndex === wordIndex;
      return (
        <span
          key={wordIndex}
          className={`word ${isActive ? "active" : ""}`}
        >
          {word.split("").map((letter, letterIndex) => {
            // Determine the typed string for this word based on its status
            const typedForWord =
              wordIndex < currentWordIndex
                ? typedWords[wordIndex] || ""
                : currentWordIndex === wordIndex
                ? currentTypedWord
                : "";

            const isCorrect =
              typedForWord[letterIndex] === letter &&
              letterIndex < typedForWord.length;

            const notTypedYet = typedForWord.length <= letterIndex;

            // Caret is rendered only for the active word
            const isCaretHere =
              currentWordIndex === wordIndex &&
              currentTypedWord.length === letterIndex;

            // Force default styling for the first character of a new active word after a space
            const forceDefault =
              isActive &&
              currentTypedWord === "" &&
              letterIndex === 0;

            return (
              <span
                key={letterIndex}
                className={`letter ${
                  forceDefault
                    ? "default"
                    : isCorrect
                    ? "correct"
                    : notTypedYet
                    ? "default"
                    : "wrong"
                } ${isCaretHere ? "has-caret" : ""}`}
              >
                {isCaretHere && <span className="caret" />}
                {letter}
              </span>
            );
          })}
          
          {/* Overwrite handle */}
          {currentWordIndex === wordIndex &&
            currentTypedWord.length > word.length && (
              <span className="letter overwrite">
                {currentTypedWord.substring(word.length)}
              </span>
            )}
        </span>
      );
    });
  }

  return (
    <div className="container">
      {/* Premium Ambient Glow Blobs */}
      <div className="glow-blob glow-blob-1"></div>
      <div className="glow-blob glow-blob-2"></div>

      <header className="header">
        <div className="header__brand">
          <h1 className="header__title">Monotype</h1>
          <p className="header__subtitle">Minimalist layout. Maximal speed.</p>
        </div>
      </header>

<div className="settings-panel">
  <div className="setting-group themes">
    <span className="setting-label">Theme</span>
    <div className="theme-buttons">
      {["midnight", "cyberpunk", "nord", "dracula", "emerald", "retro"].map((t) => (
        <button
          key={t}
          className={`theme-btn ${theme === t ? "active" : ""}`}
          onClick={() => setTheme(t)}
          aria-label={`Select ${t} theme`}
        >
          <span className={`theme-dot ${t}`}></span>
          {t}
        </button>
      ))}
    </div>
  </div>

  <div className="setting-group sound">
    <span className="setting-label">Sound Clicks</span>
    <div className="sound-buttons">
      {[
        { id: "blue", name: "Cherry Blue" },
        { id: "brown", name: "Cherry Brown" },
        { id: "red", name: "Cherry Red" },
        { id: "off", name: "Mute" }
      ].map((s) => (
        <button
          key={s.id}
          className={`sound-btn ${soundProfile === s.id ? "active" : ""}`}
          onClick={() => setSoundProfile(s.id)}
        >
          {s.name}
        </button>
      ))}
    </div>
  </div>
</div>

      <main className="main-content">
        {/* Floating live stats bar and relocated reset button */}
        <div className="workspace-header">
          <div className="live-stats">
            <div className="stat-pill wpm">
              <span className="pill-label">WPM</span>
              <span className="pill-value">{liveStats.wpm}</span>
            </div>
            <div className="stat-pill accuracy">
              <span className="pill-label">ACCURACY</span>
              <span className="pill-value">{liveStats.accuracy}%</span>
            </div>
          </div>
          
          <button 
            className="refresh-btn relocated" 
            onClick={refreshQuote}
            aria-label="Refresh Quote"
            id="refresh-btn"
          >
            <IoReload size={16} />
            <span className="refresh-text">New Quote</span>
          </button>
        </div>

        {/* Make the quote box focusable and forward focus to hidden input */}
{/* Added onClick to focus the hidden input when the quote box is clicked */}
{/* Also added tabIndex for keyboard accessibility */}

  <div className="quote-card" tabIndex={0} onClick={() => quoteCardRef.current?.focus()} onKeyDown={handleKeyDown} ref={quoteCardRef}>
  <div className="quote-card__body">
    <p className="quote-text">{renderTextToType()}</p>
  </div>
</div>

  {/* Typing logic now lives in App.js – no separate TypingInput component needed */}

        {results && (
          <section className="results-panel">
            <h2 className="results-panel__title">Performance Metrics</h2>
            <div className="stats-grid">
              <div className="stat-card wpm">
                <span className="stat-card__value">{results.wpm}</span>
                <span className="stat-card__label">WPM</span>
                <span className="stat-card__desc">Words per Minute</span>
              </div>
              
              <div className="stat-card cpm">
                <span className="stat-card__value">{results.cpm}</span>
                <span className="stat-card__label">CPM</span>
                <span className="stat-card__desc">Characters per Minute</span>
              </div>
              
              <div className="stat-card time">
                <span className="stat-card__value">{results.time}s</span>
                <span className="stat-card__label">Time</span>
                <span className="stat-card__desc">Elapsed Duration</span>
              </div>

              <div className="stat-card total">
                <span className="stat-card__value">{results.accuracy}%</span>
                <span className="stat-card__label">Accuracy</span>
                <span className="stat-card__desc">{results.words} words ({results.characters} chars)</span>
              </div>
            </div>
            
            <div className="results-panel__footer">
              <p>Awesome work! Press the reload button or start typing to challenge yourself again.</p>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Monotype &copy; {new Date().getFullYear()} &bull; Sleek Touch-Typing Trainer</p>
      </footer>
    </div>
  );
}

export default App;
