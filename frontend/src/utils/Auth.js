export const isAuthenticated = () => {
    const token = localStorage.getItem("authToken"); // Supponendo che salvi il token dopo il login
    console.log("Token presente:", token); // Controllo di debug
    return token !== null; // Se il token esiste, l'utente è autenticato
  };
  