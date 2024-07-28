export default {
  defaultTab: 'Sign In',
  testMode: true,

  // Function to set the default tab
  setDefaultTab(newTab) {
    this.defaultTab = newTab;
  },

  // Function to generate a random value (used in test mode)
  generateRandomValue() {
    return Math.random().toString(36).substring(2, 15);
  },

  // Function to generate a hashed password
  generatePasswordHash() {
    const password = inp_registerPassword.text || this.generateRandomValue();
    if (!inp_registerPassword.text) {
      showAlert('No password entered, using random test value: ' + password, 'warning');
    }
    return dcodeIO.bcrypt.hashSync(password, 10);
  },

  // Function to generate a random email
  generateRandomEmail() {
    return 'test' + Math.random().toString(36).substring(2, 15) + '@example.com';
  },

  // Function to generate random VAT number
  generateRandomVAT() {
    return Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  },

  // Function to create a token (dummy function for test mode)
  async createToken(user) {
    return 'dummy-token-for-' + user.email;
  },

  // Function to handle user sign-in
  async signIn() {
    const password = inp_password.text || 'testpassword';

    // Fallback to test values if in test mode and inputs are empty
    const email = inp_email.text || 'test@example.com';
    if (this.testMode && !inp_email.text) {
      showAlert('Test mode is on. Using default test email for sign-in.', 'warning');
    }

    const user = await findUserByEmail.run({ email });

    if (user && dcodeIO.bcrypt.compareSync(password, user.password_hash)) {
      await storeValue('token', await this.createToken(user));
      await updateLogin.run({ id: user.id });
      showAlert('Login Success', 'success');
    } else {
      showAlert('Invalid email/password combination', 'error');
    }
  },

  // Function to handle user registration
  async register() {
    const passwordHash = await this.generatePasswordHash();

    // Fallback to test values if in test mode and inputs are empty
    const first_name = inp_firstName.text || 'TestFirstName';
    const last_name = inp_lastName.text || 'TestLastName';
    const email = inp_registerEmail.text || this.generateRandomEmail();
    // Use email as username
    const username = email;

    if (this.testMode) {
      showAlert('Test mode is on. Using default test values for registration.', 'warning');
    }

    const payload = {
      first_name,
      last_name,
      email,
      username,
      password_hash: passwordHash,
      last_login: new Date().toISOString().slice(0, 19).replace('T', ' '),
      role: 'user',
      created: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    const user = await createUser.run(payload);

    if (user) {
      storeValue('token', await this.createToken(user));
      showAlert('Register Success', 'success');
    } else {
      showAlert('Error creating new user', 'error');
    }
  }
};


// ------------------------------------------------------------

// ------------------------------------------------------------
// Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------












