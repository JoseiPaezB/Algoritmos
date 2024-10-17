
document.getElementById('fileInput1').addEventListener('input', function() {
    var file = document.getElementById('fileInput1').files[0];
    if (file) {
        document.getElementById('nameFile1').innerHTML = `Archivo seleccionado: ${file.name}`;
         // Limpia las sugerencias
         clearSuggestions();
    }
});

document.getElementById("uploadBtn").addEventListener("click", function(event) {
    document.getElementById('poli').style.marginTop="6rem"; 
    event.preventDefault();
    const file1 = document.getElementById('fileInput1').files[0];
    const file2 = document.getElementById('fileInput2').files[0];
   
    // Mueve el contenedor hacia abajo
    
    if (file1 && file2) {
        nameFile1.textContent = `Archivo seleccionado: ${file1.name}`;
        nameFile2.textContent = `Archivo seleccionado: ${file2.name}`;
        
        // Leer el contenido del archivo 1
        similitudes.style.display = 'block';

        // Bloquear las tarjetas
        bloquearTarjetas();

        // Leer el contenido del archivo 1
        similitudes.style.display = 'block';

        
    }else if(file1 && !file2){
        desbloquearTarjetas();
         // Leer el contenido del archivo
         const reader = new FileReader();
         reader.onload = function(event) {
             const fileContent = event.target.result;
 
             // Enviar una petición al servidor para reinicializar el Trie
             fetch('/reset-trie', {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json'
                 }
             }).then(() => {
                 // Después de reinicializar el Trie, subir el archivo
                 fetch('/longest-palindrome', {
                     method: 'POST',
                     headers: {
                         'Content-Type': 'application/json'
                     },
                     body: JSON.stringify({ text: fileContent }) // Enviar el contenido del archivo
                 })
                 .then(response => response.json())
                 .then(data => {
                     const highlightedText = highlightPalindrome(fileContent, data.longestPalindrome);
                     document.getElementById('result').innerHTML = highlightedText;
                    
                   
                 })
                 .catch(error => {
                     console.error('Error:', error);
                 });
             });
         };
         reader.readAsText(file1);
    }
        
});

function desbloquearTarjetas() {
    palindromosCard.style.pointerEvents = 'auto';
    trieCard.style.pointerEvents = 'auto';
    buscarCard.style.pointerEvents = 'auto';
    palindromosCard.style.opacity = '1';
    trieCard.style.opacity = '1';
    buscarCard.style.opacity = '1';
}

function bloquearTarjetas() {
    palindromosCard.style.pointerEvents = 'none';
    trieCard.style.pointerEvents = 'none';
    buscarCard.style.pointerEvents = 'none';
    palindromosCard.style.opacity = '0.5';
    trieCard.style.opacity = '0.5';
    buscarCard.style.opacity = '0.5';
}

// Función para resaltar el palíndromo más largo en el texto
// Función para resaltar todas las apariciones del palíndromo en el texto
function highlightPalindrome(text, palindrome) {
    if (!palindrome) return text; // Si no hay palíndromo, devolver el texto original

    // Escapamos caracteres especiales del palíndromo para evitar problemas en la expresión regular
    const escapedPalindrome = palindrome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Creamos la expresión regular (insensible a mayúsculas/minúsculas y global) para encontrar todas las apariciones del palíndromo
    const regex = new RegExp(`(${escapedPalindrome})`, 'gi');

    // Reemplazamos todas las apariciones del palíndromo en el texto por la versión resaltada
    return text.replace(regex, '<span class="highlight">$1</span>');
}


document.getElementById("wordInput").addEventListener("input", function() {
    const prefix = this.value;
    clearSuggestions();

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
    else{
        clearSuggestions(); // Limpia las sugerencias
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
            console.log("res" + fileContent.length);
            if(fileContent.length < 750 && fileContent.length > 150){
                document.getElementById('poli').style.marginTop="12rem";

            }
            if(fileContent.length < 2000 && fileContent.length > 750){
                document.getElementById('poli').style.marginTop="25rem";
            }
            if(fileContent.length > 2000){
                document.getElementById('poli').style.marginTop="30rem";
            }
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