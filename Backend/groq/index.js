const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: "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" });

// Función para obtener la palabra de la IA
async function getWordFromAI({ words, dictionary, previousWords, incorrectLetters, correctLettersWrongPosition, correctLettersRightPosition }) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{
                role: "system",
                content: `
                    Imagínate que estás jugando al juego Wordle, el cual consiste en adivinar una palabra aleatoria de 5 letras. 
                    Dame siempre una palabra de 5 letras. Respóndeme solo con la palabra de 5 letras en español. 
                    Aquí tienes algunas pistas:
                    - Letras incorrectas: ${incorrectLetters.join(", ")}.
                    - Letras correctas en la posición incorrecta: ${correctLettersWrongPosition.join(", ")}.
                    - Letras correctas y en la posición correcta: ${correctLettersRightPosition.join(", ")}.
                    - En estas pistas se indica por cada posición de la palabra (0,1,2,3,4) qué letra es la más probable de que esté en la palabra.
                      Por ejemplo {"0":{"a":2, "b":3}} significará que en la posición 0 (la primera) la letra b sale 3 veces de cada 5 y la letra a 2. 
                      Por lo que será mejor escoger la b ya que es más probable: ${JSON.stringify(dictionary)}.
                    Importante que sea de cinco letras y este en las pistas que te he pasado!
                `
            }],
            model: "llama3-8b-8192"
        });
        return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Error al obtener la palabra de la IA:", error);
        return ""; // Manejar el error según sea necesario
    }
}

module.exports = { getWordFromAI };
