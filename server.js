import express from 'express';

// initialize our express server
const app = express();

// parse json middleware
app.use(express.json());

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
		res.json('signed in!');
	} else {
		res.status(400).json("nah, didn't make it");
	}
});

// post when someone registers
app.post('/register', (req, res) => {
	const { email, name, password } = req.body;
	database.users.push({
		id: '125',
		name: name,
		email: email,
		password: password,
		entries: 0,
		joined: new Date(),
	});
	res.json(database.users[database.users.length - 1]);
});

// listen to server on port 3000
app.listen(3000, () => {
	console.log('app is running on port 3000!');
});
