const express = require('express');
const app = express();
const terminalRoutes = require('./routes/terminal');

app.use(express.json());
app.use('/api', terminalRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
