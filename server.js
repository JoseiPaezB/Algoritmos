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

function lcs(text1, text2) {
    let m = text1.length;
    let n = text2.length;

    // Crear la matriz dp con cadenas vacías
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(""));

    // Llenar la matriz dp
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + text1[i - 1];
            } else {
                dp[i][j] = (dp[i - 1][j].length > dp[i][j - 1].length) ? dp[i - 1][j] : dp[i][j - 1];
            }
        }
    }

    // Extraer la subsecuencia común más larga
    const lcs = dp[m][n];
    
    // Rastrear las posiciones de las coincidencias en text1 y text2
    const pos1 = [];
    const pos2 = [];
    
    let i = m, j = n;
    while (i > 0 && j > 0) {
        if (text1[i - 1] === text2[j - 1]) {
            pos1.unshift(i - 1); // Agrega al principio para mantener el orden
            pos2.unshift(j - 1); // Agrega al principio para mantener el orden
            i--;
            j--;
        } else if (dp[i - 1][j].length > dp[i][j - 1].length) {
            i--;
        } else {
            j--;
        }
    }

    // Devolver la subsecuencia común y las posiciones en ambos textos
    return {
        lcs: lcs, 
        positions: { pos1, pos2 }
    };
}

app.post('/longest-common-subsequence', (req, res) => {
    const { text1, text2 } = req.body;

    if (!text1 || !text2) {
        return res.status(400).json({ error: 'Texts must be provided.' });
    }

    const result = lcs(text1, text2);

    // Función para resaltar caracteres en las posiciones coincidentes
    function highlightText(text, positions) {
        let highlighted = '';
        for (let i = 0; i < text.length; i++) {
            if (positions.includes(i)) {
                highlighted += `<span class="highlight">${text[i]}</span>`;
            } else {
                highlighted += text[i];
            }
        }
        return highlighted;
    }

    const highlightedText1 = highlightText(text1, result.positions.pos1);
    const highlightedText2 = highlightText(text2, result.positions.pos2);

    res.status(200).json({
        lcs: result.lcs,
        highlightedText1: highlightedText1,
        highlightedText2: highlightedText2
    });
});

    

// Instancia del Trie
let trie = new Trie();

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

app.post('/reset-trie', (req, res) => {
    trie = new Trie(); // Reiniciar el Trie
    res.status(200).send('Trie reseteado');
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
