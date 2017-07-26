require('dotenv').config();

const PORT = process.env.PORT || 7000;
const app = require('./app');

app.listen(PORT, () => {
  console.log(`SEARCH server listening on port ${PORT}!`);
});