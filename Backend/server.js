const express = require('express');
const fs = require('fs');
const { getWordFromAI } = require('./groq/index.js'); // Importar la función desde el archivo separado

const app = express();

// Función para leer palabras desde un archivo de texto
function readWordsFromFile(filename) {
    const data = fs.readFileSync(filename, 'utf8');
    return data.split(',').map(word => word.trim());
}

function countLetterOccurrences(dictionary, restrictions) {
    const counts = {};
   
    for (const word of dictionary) {
      for (let i = 0; i < word.length; i++) {
        const letter = word[i];
        
        // Comprobar las restricciones
        if (restrictions["2"] && restrictions["2"][letter] !== undefined) continue;
        if (restrictions["1"] && restrictions["1"][letter] === i) continue;
        if (restrictions["0"] && Object.values(restrictions["0"]).includes(i) && restrictions["0"][letter] !== i) continue;
  
        // Incrementar el conteo
        if (!counts[i]) {
          counts[i] = {};
        }
        if (!counts[i][letter]) {
          counts[i][letter] = 0;
        }
        counts[i][letter]++;
      }
    }
  
    return counts;
  }

function getLastWord(phrase) {
    const words = phrase.trim().split(' ');
    return words[words.length - 1];
}

function searchWord(word, wordList) {
    const lowercaseWord = word.toLowerCase();
    return wordList.includes(lowercaseWord);
}

function getMostSimilarWord(wordList, targetWord) {
    let maxMatches = 0;
    let mostSimilarWord = '';

    for (let word of wordList) {
        let matches = 0;
        for (let letter of word) {
            if (targetWord.includes(letter)) {
                matches++;
            }
        }
        if (matches > maxMatches) {
            maxMatches = matches;
            mostSimilarWord = word;
        }
    }

    return mostSimilarWord || null;
}
// Función para obtener una palabra aleatoria de una lista de palabras
function getRandomWord(wordList) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    return wordList[randomIndex];
}

// Lee las palabras del diccionario para diferentes idiomas
const wordsEn = readWordsFromFile('words-en.txt');
const wordsEs = readWordsFromFile('words-es.txt');
const wordsEu = readWordsFromFile('words-eu.txt');

// Ruta para obtener la palabra del día
app.get("/word-of-the-day", (req, res) => {
    const { language } = req.query;
    let words;
    if (language === 'en') {
        words = readWordsFromFile('words-en.txt');
    } else if (language === 'eu') {
        words = readWordsFromFile('words-eu.txt');
    } else {
        words = readWordsFromFile('words-es.txt'); // Por defecto, utilizar el diccionario en español
    }
    const randomWord = getRandomWord(words);
    res.json({ wordOfTheDay: randomWord });
});

// Ruta para verificar si una palabra está en el diccionario
app.get("/check-word", (req, res) => {
    const { word, language } = req.query;
    let words;
    if (language === 'en') {
        words = readWordsFromFile('words-en.txt');
    } else if (language === 'eu') {
        words = readWordsFromFile('words-eu.txt');
    } else {
        words = readWordsFromFile('words-es.txt'); // Por defecto, utilizar el diccionario en español
    }
    const isInDictionary = searchWord(word, words);
    res.json({ isInDictionary });
});

app.get("/get-word-from-ai", async (req, res) => {
    try {
      // Extraer los parámetros de la query
      const restrictions = JSON.parse(req.query.restrictions);
      const incorrectLetters = JSON.parse(req.query.incorrectLetters);
      const correctLettersWrongPosition = JSON.parse(req.query.correctLettersWrongPosition);
      const correctLettersRightPosition = JSON.parse(req.query.correctLettersRightPosition);
      const previousWords = JSON.parse(req.query.previousWords);
  
      // Leer las palabras del archivo y contar las ocurrencias de letras según las restricciones
      let words = readWordsFromFile('words-es.txt');
      let dictionary = countLetterOccurrences(words, restrictions);
  
      // Construir el objeto con todos los parámetros necesarios
      const parameters = {
        words, // Aquí agregamos el diccionario
        dictionary,
        previousWords,
        incorrectLetters,
        correctLettersWrongPosition,
        correctLettersRightPosition,
      };
  
      // Llamar a la función getWordFromAI con el objeto parameters
      const word = await getWordFromAI(parameters);
  
      // Enviar la palabra generada de vuelta al cliente
      res.json({ word, dictionary });
    } catch (error) {
      console.error('Error en /get-word-from-ai:', error);
      res.status(500).json({ error: 'Error al obtener la palabra de la IA' });
    }
});

// Iniciar el servidor en el puerto 5000
app.listen(5000, () => {
    console.log("Server started on port 5000");
});