import { config } from 'dotenv';
import express from 'express';
import { engine } from 'express-handlebars';
import mongoose from 'mongoose';
import './models/Idea.js';

const app = express();

config();
/*
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/test')
  .then(() => console.log('MongoDB Connected...'));
}
*/

// Map global promise - get rid of warning
//mongoose.Promise = global.Promise;
// Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev', {
  useNewUrlParser: true
})
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Load Idea Model
//require('./models/Idea');
const Idea = mongoose.model('ideas');

// Handlebars Middleware
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Index Route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    title: title
  });
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});

// Add Idea Form
app.get('/ideas/add', (req, res) => {
  res.render('ideas/add');
});
/*
const port = 5500;

app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});
*/
const PORT = parseInt(process.env.PORT) || 5500;

app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});