
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve website files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Start the server
app.listen(PORT, () => {
    console.log("================================");
    console.log("CodeQuest AI is running!");
    console.log(`Website: http://localhost:${PORT}`);
    console.log("================================");
});
        