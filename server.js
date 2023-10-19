import express from 'express';
import cors from 'cors';
import knex from 'knex';

// connect to local pg db through knex
const db = knex({
	client: 'pg',
	connection: {
		host: '127.0.0.1',
		port: 5432,
		user: 'javi',
		password: '',
		database: 'smart-brain',
	},
});

// initialize our express server
const app = express();

// parse json middleware
app.use(express.json());

// cors middleware
app.use(cors());

// demo database
const database = {
	users: [
		{
			id: '123',
			name: 'John',
			email: 'john@gmail.com',
			password: 'cookies',
			entries: 0,
			joined: new Date(),
		},
		{
			id: '124',
			name: 'Sally',
			email: 'sally@gmail.com',
			password: 'bananas',
			entries: 0,
			joined: new Date(),
		},
	],
};

// root get for testing
app.get('/', (req, res) => {
	res.send(database.users);
});

// post when someone tries to sign in, either success/fail
app.post('/signin', (req, res) => {
	if (
		req.body.email === database.users[0].email &&
		req.body.password === database.users[0].password
	) {
		res.json(database.users[0]);
	} else {
		res.status(400).json("nah, didn't make it");
	}
});

// post when someone registers
app.post('/register', (req, res) => {
	const { email, name, password } = req.body;
	db('users')
		.returning('*')
		.insert({
			email: email,
			name: name,
			joined: new Date(),
		})
		.then((user) => {
			res.json(user[0]);
		})
		.catch((err) => res.status(400).json('unable to register'));
});

// get user for profile
app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	let found = false;
	database.users.forEach((user) => {
		if (user.id === id) {
			found = true;
			return res.json(user);
		}
	});
	if (!found) {
		res.status(404).json("couldn't find the user");
	}
});

// listen to server on port 3000
app.listen(3000, () => {
	console.log('app is running on port 3000!');
});
