import express from 'express';
import cors from 'cors';
import knex from 'knex';
import bcrypt from 'bcrypt-nodejs';

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
	db.select('email', 'hash')
		.from('login')
		.where('email', '=', req.body.email)
		.then((data) => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			if (isValid) {
				return db
					.select('*')
					.from('users')
					.where('email', '=', req.body.email)
					.then((user) => {
						res.json(user[0]);
					})
					.catch((err) => res.status(400).json('unable to get user'));
			} else {
				res.status(400).json('wrong credentials');
			}
		})
		.catch((err) => res.status(400).json('wrong credentials'));
});

// post when someone registers
app.post('/register', (req, res) => {
	const { email, name, password } = req.body;
	const hash = bcrypt.hashSync(password);
	db.transaction((trx) => {
		trx
			// first insert hash and email into login
			.insert({
				hash: hash,
				email: email,
			})
			.into('login')
			// return email to use loginemail as data for inserting data into user
			.returning('email')
			.then((loginEmail) => {
				return trx('users')
					.returning('*')
					.insert({
						email: loginEmail[0].email,
						name: name,
						joined: new Date(),
					})
					.then((user) => {
						res.json(user[0]);
					});
			})
			.then(trx.commit)
			.catch(trx.rollback);
	});
});

// get user for profile
app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	db.select('*')
		.from('users')
		.where({ id })
		.then((user) => {
			// check if array isn't empty, which would mean there's no user for a given id
			if (user.length) {
				res.json(user[0]);
			} else {
				res.status(400).json('Not found');
			}
		})
		.catch((err) => res.status(400).json('Error getting user'));
});

// listen to server on port 3000
app.listen(3000, () => {
	console.log('app is running on port 3000!');
});
