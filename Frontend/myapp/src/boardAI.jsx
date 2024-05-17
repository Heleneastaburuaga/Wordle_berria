import React, { useEffect, useState } from 'react';
import Galdu from './galdu';
import {Main, Header, GameSection, TileContainer, TileRow, Tile} from './estiloa';
import "./App.css";

function Board({ word, language, onWin, currentTurn, setCurrentTurn}) {

  const [turn, setTurn] = useState(1);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [canProceed, setCanProceed] = useState(true);
  const [win, setWin] = useState(false);
  const [wordNotFound, setWordNotFound] = useState(false);
  const [wordFromAI, setWordFromAI] = useState('');
  const [dictionary, setDictionary] = useState({});

  const [previousWords, setPreviousWords] = useState([]);
  const [incorrectLetters, setIncorrectLetters] = useState([]);
  const [correctLettersWrongPosition, setCorrectLettersWrongPosition] = useState([]);
  const [correctLettersRightPosition, setCorrectLettersRightPosition] = useState([]);

  const [guesses, setGuesses] = useState({
    0: Array.from({ length: 5 }).fill(""),
    1: Array.from({ length: 5 }).fill(""),
    2: Array.from({ length: 5 }).fill(""),
    3: Array.from({ length: 5 }).fill(""),
    4: Array.from({ length: 5 }).fill(""),
    5: Array.from({ length: 5 }).fill("")
  });
  const [tileColors, setTileColors] = useState({});

  useEffect(() => {
    fetchWordFromAI();  
  }, []);
  
  useEffect(() => {
    if (currentTurn === 'ai') {
      fetchWordFromAI();
  }
  }, [currentTurn,dictionary]);

 console.log("Hitza ia: " + wordFromAI)
 const restrictions = {...dictionary};
    console.log("Restrictions: " + JSON.stringify(restrictions));

    const fetchWordFromAI = async () => {
      try {
        const queryParams = new URLSearchParams({
          restrictions: JSON.stringify(restrictions),
          incorrectLetters: JSON.stringify(incorrectLetters),
          correctLettersWrongPosition: JSON.stringify(correctLettersWrongPosition),
          correctLettersRightPosition: JSON.stringify(correctLettersRightPosition),
          previousWords: JSON.stringify(previousWords),
        });
    
        const response = await fetch(`/get-word-from-ai?${queryParams}`);
        if (!response.ok) {
          throw new Error('Error al obtener la palabra de la IA desde el backend');
        }
        const data = await response.json();
        setWordFromAI(data.word);
        console.log(data.dictionary);
      } catch (error) {
        console.error(error);
      }
    };
  console.log("Hitza ia " + wordFromAI)
  console.log("Array asmatu " + correctLettersRightPosition )
  console.log("array amarillo " + correctLettersWrongPosition)
  console.log("Array ez " + incorrectLetters)
  console.log("Array sartutakoak " + previousWords)

  const updateArrays = (aiWord, targetWord) => {
    const newIncorrectLetters = [];
    const newCorrectLettersWrongPosition = [];
    const newCorrectLettersRightPosition = [];

    // Convertir ambas palabras a minúsculas para hacer la comparación insensible a mayúsculas y minúsculas
    const aiWordLower = aiWord.toLowerCase();
    const targetWordLower = targetWord.toLowerCase();

    for (let i = 0; i < aiWord.length; i++) {
        const letter = aiWordLower[i]; // Utiliza la versión en minúsculas de la letra de la palabra adivinada

        if (!targetWordLower.includes(letter)) {
            if (!incorrectLetters.includes(letter)) {
                newIncorrectLetters.push(letter);
            }
        } else if (targetWordLower[i] === letter) {
            if (!correctLettersRightPosition.includes(letter)) {
                newCorrectLettersRightPosition.push(letter);
            }
        } else {
            if (!correctLettersWrongPosition.includes(letter)) {
                newCorrectLettersWrongPosition.push(letter);
            }
        }
    }

    // Actualiza los arrays de letras con las nuevas letras encontradas
    setIncorrectLetters([...incorrectLetters, ...newIncorrectLetters]);
    setCorrectLettersWrongPosition([...correctLettersWrongPosition, ...newCorrectLettersWrongPosition]);
    setCorrectLettersRightPosition([...correctLettersRightPosition, ...newCorrectLettersRightPosition]);
};


  useEffect(() => {
    setTurn(1);
    setCurrentLetterIndex(0);
    setCanProceed(true);
    setWin(false);
    setWordNotFound(false);
    setGuesses({
      0: Array.from({ length: 5 }).fill(""),
      1: Array.from({ length: 5 }).fill(""),
      2: Array.from({ length: 5 }).fill(""),
      3: Array.from({ length: 5 }).fill(""),
      4: Array.from({ length: 5 }).fill(""),
      5: Array.from({ length: 5 }).fill("")
    });
    setTileColors({});
  }, [language]);

 
  useEffect(() => {
    if (wordFromAI) {
        updateArrays(wordFromAI, word);
        setPreviousWords([...previousWords, wordFromAI]);
    }
}, [wordFromAI]);

  function countLetters(string) {
    const counts = {};
    for (let i = 0; i < string.length; i++) {
      const letter = string[i];
      if (counts[letter]) {
        counts[letter]++;
      } else {
        counts[letter] = 1;
      }
    }
    return counts;
  }

  async function onEnter() {
    if(currentTurn === 'ai'){
      try {
        const response = await fetch(`/check-word?word=${guesses[turn - 1].join("").toLowerCase()}&language=${language}`);
        if (!response.ok) {
          throw new Error('Error al verificar la palabra en el backend');
        }
        const data = await response.json();
        const isInDictionary = data.isInDictionary;
    
        if (isInDictionary) {
          setCanProceed(true);
          setTurn(turn + 1);
          setCurrentLetterIndex(0);
          console.log("Turn: " + turn);
          let newDictionary = { ...dictionary };
          let newTileColors = {tileColors };
            Object.values(guesses).forEach((guess, guessIndex) => {
              let hitzak = countLetters(word);
              guess.forEach((guessChar, charIndex) => {
                let zenbaki = hitzak[guessChar];
                if (guessChar === word[charIndex]) { 
                  newDictionary["0"] = { ...newDictionary["0"], [guessChar]: charIndex };
                } else if (word.includes(guessChar) && zenbaki > 0) {
                  newDictionary["1"] = { ...newDictionary["1"], [guessChar]: charIndex };
                } else if (!word.includes(guessChar)) {
                  newDictionary["2"] = { ...newDictionary["2"], [guessChar]: 1 };
                }
              });
            });
            setDictionary(newDictionary);
            setTileColors(newTileColors);
          
            if(word === guesses[turn - 1].join("")){
              setCanProceed(false);
              setWin(true);
              onWin(); 
            }
            setCurrentTurn('player');
  
          } else {
            setWordNotFound(true);
            console.log("ez dago hiztegian");
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  
    useEffect(() => {
      //const handleKeyDown = (e) => {
       // console.log("key: " + e.key);
        //if (e.key === "Enter") {
          let newGuesses = { ...guesses };
          for (let i = 0; i < wordFromAI.length; i++) {
            newGuesses[turn - 1][i] = wordFromAI[i].toUpperCase();
            
          }
          console.log(newGuesses);
          setGuesses(newGuesses);
          onEnter();
          console.log("enter");
       // }
      //}
       
     /* window.addEventListener("keydown", handleKeyDown);
    
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };*/
    }, [currentTurn]);
  
    return win && currentTurn === 'ai' ? (
      <Galdu />
    ) : (
      <Main>
         <p>Letras adivinadas: {Object.keys(dictionary["0"] || {}).length}</p>
          <p>Letras en la posición incorrecta: {Object.keys(dictionary["1"] || {}).length}</p>
      </Main>
    );
  }
  
  export default Board;
  