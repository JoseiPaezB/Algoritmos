const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// Función que implementa el algoritmo de Manacher
function manacher(s) {
    let n = s.length;
    let t = "$#";
    for (let c of s) t += c + '#';
    t += '@'; // Transformar s para manejar cadenas pares/impares

    let m = t.length, center = 0, right = 0;
    let p = new Array(m).fill(0); // p[i] almacena el radio del palíndromo más largo centrado en i

    let max_len = 0, max_center = 0;
    for (let i = 1; i < m - 1; i++) {
        let mirror = 2 * center - i;
        if (i < right)
            p[i] = Math.min(right - i, p[mirror]);

        // Intentar expandir el palíndromo centrado en i
        while (t[i + p[i] + 1] === t[i - p[i] - 1])
            p[i]++;

        // Si expande más allá de la derecha, actualiza center y right
        if (i + p[i] > right) {
            center = i;
            right = i + p[i];
        }

        // Actualiza la longitud máxima del palíndromo
        if (p[i] > max_len) {
            max_len = p[i];
            max_center = i;
        }
    }

    // Encontrar la subcadena palíndroma más larga
    let start = Math.floor((max_center - max_len) / 2);
    return s.substring(start, start + max_len);
}

// Clase Trie
class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;
        for (const char of word) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isEndOfWord = true;
    }

    searchPrefix(prefix) {
        let node = this.root;
        for (const char of prefix) {
            if (!node.children[char]) {
                return [];
            }
            node = node.children[char];
        }
        return this._wordsWithPrefix(node, prefix);
    }

    _wordsWithPrefix(node, prefix) {
        const results = [];
        if (node.isEndOfWord) {
            results.push(prefix);
        }
        for (const char in node.children) {
            results.push(...this._wordsWithPrefix(node.children[char], prefix + char));
        }
        return results;
    }
}

// Instancia del Trie
const trie = new Trie();

// Ruta para procesar el archivo de texto y devolver el resultado del algoritmo de Manacher
app.post('/longest-palindrome', (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'No text provided.' });
    }

    // Divide el texto en palabras y las inserta en el Trie
    const words = text.match(/\b\w+\b/g) || []; // Usa una expresión regular para obtener las palabras
    words.forEach(word => trie.insert(word));

    const result = manacher(text);

    res.status(200).json({ 
        longestPalindrome: result 
    });
});

// Ruta para insertar palabras en el Trie
app.post('/insert-word', (req, res) => {
    const { word } = req.body;

    if (!word) {
        return res.status(400).json({ error: 'No word provided.' });
    }

    trie.insert(word);
    res.status(200).json({ message: `Word "${word}" inserted successfully.` });
});

// Ruta para buscar palabras con un prefijo
app.post('/search-prefix', (req, res) => {
    const { prefix } = req.body;

    if (!prefix) {
        return res.status(400).json({ error: 'No prefix provided.' });
    }

    const words = trie.searchPrefix(prefix);
    res.status(200).json({ words: words });
});

// Función KMP (Knuth-Morris-Pratt) para búsqueda de patrones
function kmpSearch(text, pattern) {
    const n = text.length;
    const m = pattern.length;
    const lps = new Array(m).fill(0);
    let j = 0; // índice para el patrón

    computeLpsArray(pattern, m, lps);

    const result = [];
    let i = 0; // índice para el texto

    while (i < n) {
        if (pattern[j] === text[i]) {
            i++;
            j++;
        }

        if (j === m) {
            result.push(i - j);
            j = lps[j - 1];
        } else if (i < n && pattern[j] !== text[i]) {
            if (j !== 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }
    return result;
}

// Función para calcular el arreglo LPS
function computeLpsArray(pattern, m, lps) {
    let length = 0; // Longitud del anterior LPS
    let i = 1;

    while (i < m) {
        if (pattern[i] === pattern[length]) {
            length++;
            lps[i] = length;
            i++;
        } else {
            if (length !== 0) {
                length = lps[length - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }
}

// Ruta para buscar un patrón en el texto
app.post('/kmp-search', (req, res) => {
    const { text, pattern } = req.body;

    if (!text || !pattern) {
        return res.status(400).json({ error: 'Text and pattern must be provided.' });
    }

    const positions = kmpSearch(text, pattern);
    res.status(200).json({ positions: positions });
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
