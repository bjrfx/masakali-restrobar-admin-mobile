const express = require("express");
const path = require("path");
const app = express();

// Serve static files from the React app build folder
app.use(express.static(path.join(__dirname, "build")));

// Catch-all route: send back React's index.html for any request
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Listen on the port provided by the environment (iFastNet sets this)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});