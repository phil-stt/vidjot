import { config } from 'dotenv';
import express from 'express';
import Handlebars from 'handlebars';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import flash from 'connect-flash';
import session from 'express-session';
import mongoose from 'mongoose';
import './models/Idea.js';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';


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
//app.engine('handlebars', engine());
app.engine('handlebars', engine({
  handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Method override middleware
app.use(methodOverride('_method'));

// Express session midleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

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

// Idea Index Page
app.get('/ideas', (req, res) => {
  Idea.find({})
    .sort({ date: 'desc' })
    .then(ideas => {
      res.render('ideas/index', {
        ideas: ideas
      });
    });
});

// Add Idea Form
app.get('/ideas/add', (req, res) => {
  res.render('ideas/add');
});

// Edit Idea Form
app.get('/ideas/edit/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
    .then(idea => {
      res.render('ideas/edit', {
        idea: idea
      });
    });
});

// Process Form
app.post('/ideas', (req, res) => {
  //console.log(req.body);
  //res.send('ok');
  let errors = [];

  if (!req.body.title) {
    errors.push({ text: 'Please add a title' });
  }
  if (!req.body.details) {
    errors.push({ text: 'Please add some details' });
  }

  if (errors.length > 0) {
    res.render('ideas/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details
    }
    new Idea(newUser)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Video idea added');
        res.redirect('/ideas');
      })
  }
});

// Edit Form process
app.put('/ideas/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
    .then(idea => {
      // new values
      idea.title = req.body.title;
      idea.details = req.body.details;

      idea.save()
        .then(idea => {
          req.flash('success_msg', 'Video idea updated');
          res.redirect('/ideas');
        })
    });
});

// Delete Idea
app.delete('/ideas/:id', (req, res) => {
  Idea.deleteOne({ _id: req.params.id })
    .then(() => {
      req.flash('success_msg', 'Video idea removed');
      res.redirect('/ideas');
    });
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