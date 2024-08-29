export default {
	defaultTab: 'Sign-In',
	testMode: true,

	// Initialize the default tab to "SignIn"
	initialize() {
		console.log('Initializing with default tab set to SignIn');
		this.setDefaultTab('Sign-In');  // Set the default tab to SignIn when the app loads
	},

	// Set the tab directly to either "SignIn" or "SignUp"
	setDefaultTab(tabName) {
		if (tabName === 'Sign-In' || tabName === 'Sign-Up') {
			this.defaultTab = tabName;
		} else {
			console.error('Invalid tab name:', tabName);
		}
	},

	// Create Token (dummy function for simplicity)
	async createToken(user) {
		if (!user || !user.email) {
			throw new Error("User object is undefined or missing email.");
		}
		return 'dummy-token-for-' + user.email;
	},

	// Function to hash the password
	generatePasswordHash(inp_registerPassword) {
		if (!inp_registerPassword) {
			throw new Error("Password is required to generate hash.");
		}

		// Using bcrypt to hash the password
		const saltRounds = 10; // You can adjust the salt rounds as needed
		return dcodeIO.bcrypt.hashSync(inp_registerPassword, saltRounds);
	},

	// Sign In Function
	async signIn() {
		const password = inp_password.text || 'testpassword';
		const email = inp_email.text || 'test@example.com';

		try {
			const user = await this.findUserByEmail(email);

			if (user && user.length > 0 && dcodeIO.bcrypt.compareSync(password, user[0].password_hash)) {
				await storeValue('token', await this.createToken(user[0]));
				await this.updateLogin(user[0].user_id);
				showAlert('Login Success', 'success');
			} else {
				showAlert('Invalid email/password combination', 'error');
			}
		} catch (error) {
			console.error('Error during sign-in:', error);
			showAlert('An error occurred during sign-in', 'error');
		}
	},

	// Update Login
	async updateLogin(userId) {
		try {
			if (!userId) {
				throw new Error('User ID is undefined');
			}

			await updateLogin.run({
				id: userId,
				updated_at: new Date().toISOString().slice(0, 19).replace("T", " ")
			});

			console.log(`Updated login time for user ID: ${userId}`);
		} catch (error) {
			console.error('Error during updateLogin:', error);
			showAlert('An error occurred while updating login time', 'error');
		}
	},

	// Find User by Email
	async findUserByEmail(email) {
		try {
			if (!email) {
				throw new Error('Email is undefined');
			}

			const result = await SignIn_sql.run({ email });

			if (result && result.length > 0) {
				console.log(`User found:`, result[0]);
				return result;
			} else {
				console.log('No user found with the provided email');
				return [];
			}
		} catch (error) {
			console.error('Error during findUserByEmail:', error);
			showAlert('An error occurred while fetching user', 'error');
			return [];
		}
	},

	// Validate NIF
	isValidNIF(nif) {
		if (!nif || nif.length !== 9 || isNaN(nif)) {
			return false;
		}

		const nifArray = nif.split('').map(Number);
		const checkDigit = nifArray.pop();

		let sum = 0;
		for (let i = 0; i < nifArray.length; i++) {
			sum += nifArray[i] * (9 - i);
		}

		const expectedCheckDigit = 11 - (sum % 11);
		return expectedCheckDigit === checkDigit || (expectedCheckDigit === 10 && checkDigit === 0);
	},

	// Validate VAT
	validateVAT() {
		const nif = inp_VAT.text; // Reference to the VAT input field
		const isValid = this.isValidNIF(nif);
		return isValid;
	},

	// Register Function (for user registration)
	async register() {
		try {
			// Validate VAT/NIF before proceeding
			const isValidVAT = this.validateVAT();

			if (!isValidVAT) {
				showAlert('Invalid VAT/NIF number', 'error');
				return;
			}

			// Ensure password is provided
			if (!inp_registerPassword.text) {
				throw new Error("Password is required to generate hash.");
			}

			// Hash the password
			const hashedPassword = this.generatePasswordHash(inp_registerPassword.text);

			// Proceed with the registration
			await SignUp_sql.run({
				email: inp_registerEmail.text,
				passwordHash: hashedPassword,
				first_name: inp_firstName.text,
				last_name: inp_firstName.text,  // Assuming last_name is same as first_name for now
				vat_number: inp_VAT.text,
			});

			showAlert('User created successfully!', 'success');
		} catch (error) {
			console.error('Error during registration:', error);
			showAlert('An error occurred during registration', 'error');
		}
	}
};


// ------------------------------------------------------------

// Login page

// ------------------------------------------------------------
// Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------












