const { db } = require("./firebase");

// Funzione per autenticare l'utente
const authenticateUser = async (username, password) => {
  const usersRef = db.collection("users");
  const snapshot = await usersRef.where("username", "==", username).where("password", "==", password).get();

  if (snapshot.empty) {
    throw new Error("Username o password non validi");
  }

  return { message: "Accesso autorizzato" };
};

module.exports = { authenticateUser };
