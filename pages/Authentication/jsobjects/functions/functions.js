export default {
    defaultTab: 'Sign In', // Default tab to show on the UI
    testMode: true, // Set this to false to turn off test mode

    // Function to set the default tab
    setDefaultTab(newTab) {
        this.defaultTab = newTab;
        tab_auth.defaultTab = newTab; // Ensure the UI updates the default tab
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

    // Function to verify a hashed password
    verifyHash(password, hash) {
        return dcodeIO.bcrypt.compareSync(password, hash);
    },

    // Function to create a JWT token for the user
    createToken(user) {
        return jsonwebtoken.sign(user, 'secret', { expiresIn: 60 * 60 });
    },

    // Function to handle user sign-in
    async signIn() {
        const password = inp_password.text;

        // Fallback to test values if in test mode and inputs are empty
        const email = inp_email.text || 'test@example.com';
        if (this.testMode && !inp_email.text) {
            showAlert('Test mode is on. Using default test email for sign-in.', 'warning');
        }

        const user = await findUserByEmail.run({ email });

        if (user && this.verifyHash(password, user.password_hash)) {
            storeValue('token', this.createToken(user))
                .then(() => updateLogin.run({ id: user.id }))
                .then(() => showAlert('Login Success', 'success'));
        } else {
            showAlert('Invalid email/password combination', 'error');
        }
    },

    // Function to handle user registration
    async register() {
        const passwordHash = this.generatePasswordHash();

        // Fallback to test values if in test mode and inputs are empty
        const firstName = inp_firstName.text || 'TestFirstName';
        const lastName = inp_lastName.text || 'TestLastName';
        const email = inp_registerEmail.text || 'test@example.com';

        if (this.testMode) {
            showAlert('Test mode is on. Using default test values for registration.', 'warning');
        }

        // VAT validation before registration
        if (!vatValidation.validateVAT(lastName)) {
            showAlert('Invalid VAT number. Please check and try again.', 'error');
            return;
        }

        const user = await createUser.run({
            firstName,
            lastName,
            email,
            passwordHash
        });

        if (user) {
            storeValue('token', this.createToken(user));
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













