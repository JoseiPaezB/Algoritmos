function lcs(text1, text2) {
    let m = text1.length;
    let n = text2.length;

    // Crear la matriz dp con cadenas vacías
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(""));

    // Llenar la matriz dp
    for (var i = 1; i <= m; i++) { // Cambiado a i <= m
        for (var j = 1; j <= n; j++) { // Cambiado a j <= n
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + text1[i - 1];
            } else {
                dp[i][j] = (dp[i - 1][j].length > dp[i][j - 1].length) ? dp[i - 1][j] : dp[i][j - 1];
            }
        }
    }

    return dp[m][n]; // Esta línea está bien
}

// Ejemplo de uso

