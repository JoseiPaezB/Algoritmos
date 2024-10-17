



document.getElementById('fileInput').addEventListener('input', function() {
    var file = document.getElementById('fileInput').files[0];
    if (file) {
        document.getElementById('nameFile').innerHTML = `Archivo seleccionado: ${file.name}`;
    }
});

document.getElementById("uploadBtn").addEventListener("click", function() {
    const file = document.getElementById('fileInput').files[0];
    
    if (file) {
        // Lee el contenido del archivo
        const reader = new FileReader();
        reader.onload = function(event) {
            const fileContent = event.target.result;

            // Envía el contenido al servidor
            fetch('/longest-palindrome', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: fileContent }) // Envía el contenido del archivo
            })
            .then(response => response.json())
            .then(data => {
                const highlightedText = highlightPalindrome(fileContent, data.longestPalindrome);
                document.getElementById('result').innerHTML = highlightedText;
            })
            .catch(error => {
                console.error('Error:', error);
            });
        };
        reader.readAsText(file);
    }
});


// Función para resaltar el palíndromo más largo en el texto
function highlightPalindrome(text, palindrome) {
    if (!palindrome) return text; // Si no hay palíndromo, devolver el texto original

    // Escapamos caracteres especiales del palíndromo para evitar problemas en la expresión regular
    const escapedPalindrome = palindrome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Creamos la expresión regular (insensible a mayúsculas/minúsculas) para encontrar el palíndromo
    const regex = new RegExp(`(${escapedPalindrome})`, 'gi');

    // Reemplazamos el palíndromo en el texto por la versión resaltada
    return text.replace(regex, '<span class="highlight">$1</span>');
}

document.getElementById("wordInput").addEventListener("input", function() {
    const prefix = this.value;

    if (prefix) {
        // Envía el prefijo al servidor para buscar palabras
        fetch('/search-prefix', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prefix: prefix })
        })
        .then(response => response.json())
        .then(data => {
            showSuggestions(data.words); // Muestra las sugerencias
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        clearSuggestions(); // Limpia las sugerencias si el input está vacío
    }
});

// Muestra las sugerencias de palabras
function showSuggestions(words) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = ''; // Limpia las sugerencias anteriores

    if (words.length > 0) {
        suggestionsContainer.style.display = 'block'; // Muestra el contenedor de sugerencias
        words.forEach(word => {
            const suggestionItem = document.createElement('div');
            suggestionItem.textContent = word;
            suggestionItem.onclick = function() {
                document.getElementById('wordInput').value = word; // Pone la palabra en el input
                clearSuggestions(); // Limpia las sugerencias
            };
            suggestionsContainer.appendChild(suggestionItem); // Añade la sugerencia al contenedor
        });
    } 
}

// Limpia las sugerencias
function clearSuggestions() {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = ''; // Limpia el contenido
    suggestionsContainer.style.display = 'none'; // Oculta el contenedor
}

document.getElementById("searchBtn").addEventListener("click", function() {
    const fileInput = document.getElementById('fileInput');
    const textFile = fileInput.files[0];

    if (!textFile) {
        alert('Por favor, primero sube un archivo.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const fileContent = event.target.result;
        const pattern = document.getElementById('wordInput2').value; // Obtener el patrón del segundo input

        // Envía el texto y el patrón al servidor
        fetch('/kmp-search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: fileContent, pattern: pattern }) // Envía el contenido del archivo y el patrón
        })
        .then(response => response.json())
        .then(data => {
            // Resaltar las posiciones encontradas en el texto
            const highlightedText = highlightPattern(fileContent, data.positions, pattern); // Pasar el patrón a la función
            document.getElementById('result3').innerHTML = highlightedText; // Muestra el texto resaltado
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };
    reader.readAsText(textFile);
});

// Función para resaltar el patrón en el texto
function highlightPattern(text, positions, pattern) {
    if (!positions.length) return text; // Si no hay posiciones, devolver el texto original

    // Creamos un conjunto de rangos de caracteres a resaltar
    let highlightedText = text;
    // Sort positions in descending order to avoid index shifting
    positions.sort((a, b) => b - a);

    positions.forEach(pos => {
        // Se usa un span con clase highlight para resaltar
        highlightedText = highlightedText.slice(0, pos) + 
                         `<span class="highlight2">${highlightedText.slice(pos, pos + pattern.length)}</span>` + 
                         highlightedText.slice(pos + pattern.length);
    });

    return highlightedText;
}
document.getElementById('refreshButton').addEventListener('click', function(event) {
    event.preventDefault();
    location.reload();

});