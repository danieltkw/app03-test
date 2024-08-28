export default {
  defaultTab: 'Sign In', // Ensure this matches one of the tab names
  testMode: true,

  // Function to set the default tab
  setDefaultTab(newTab) {
    if (newTab === 'Sign In' || newTab === 'Sign Up') {
      this.defaultTab = newTab;
    } else {
      console.error('Invalid tab name:', newTab);
    }
  },

  // Function to initialize the component
  initialize() {
    console.log('Initializing with defaultTab:', this.defaultTab);
    this.setDefaultTab(this.defaultTab);
  },

  // Function to generate a random value (used in test mode)
  generateRandomValue() {
    return Math.random().toString(36).substring(2, 15);
  },

  // Function to generate a hashed password
  async generatePasswordHash() {
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
    if (!user || !user.email) {
      throw new Error("User object is undefined or missing email.");
    }
    return 'dummy-token-for-' + user.email;
  },

  // Function to handle user sign-in
  async signIn() {
    const password = inp_password.text || 'testpassword';
    const email = inp_email.text || 'test@example.com';

    if (this.testMode && !inp_email.text) {
      showAlert('Test mode is on. Using default test email for sign-in.', 'warning');
    }

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

  // Function to handle user registration
  async register() {
    const passwordHash = await this.generatePasswordHash();

    // Fallback to test values if in test mode and inputs are empty
    const first_name = inp_firstName.text || 'TestFirstName';
    const last_name = inp_lastName.text || 'TestLastName';
    const email = inp_registerEmail.text || this.generateRandomEmail();

    if (this.testMode) {
      showAlert('Test mode is on. Using default test values for registration.', 'warning');
    }

    try {
      // Execute the query using your database client
      const userInsertResult = await this.createUser({
        first_name,
        last_name,
        email,
        passwordHash,
      });

      if (userInsertResult) {
        storeValue('token', await this.createToken({ email: email }));
        showAlert('Register Success', 'success');
      } else {
        showAlert('Error creating new user', 'error');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      showAlert('An error occurred during registration', 'error');
    }
  },

  // Function to update last login
  async updateLogin(userId) {
    try {
      await updateLogin.run({
        id: userId,
        updated_at: new Date().toISOString().slice(0, 19).replace("T", " ")
      });
    } catch (error) {
      console.error('Error during updateLogin:', error);
      showAlert('An error occurred while updating login time', 'error');
    }
  },

  // Function to find user by email
  async findUserByEmail(email) {
    try {
      return await findUserByEmail.run({ email });
    } catch (error) {
      console.error('Error during findUserByEmail:', error);
      showAlert('An error occurred while fetching user', 'error');
    }
  },

  // Function to create a new user
  async createUser(payload) {
    try {
      return await createUser.run(payload);
    } catch (error) {
      console.error('Error during createUser:', error);
      showAlert('An error occurred while creating user', 'error');
    }
  },
};




// ------------------------------------------------------------

// Login page

// ------------------------------------------------------------
// Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------












