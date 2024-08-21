export default {
// vatValidation function
// appsmith need that the function always start just with 'export default {' 
// any coments shall be after the start

    isValidNIF: function (nif) {
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

    validateVAT: function () {
        const nif = inp_lastName.text; // Reference to the NIF input field
        const isValid = this.isValidNIF(nif);
        return isValid;
    }
};
// ------------------------------------------------------------

// VatValidation

// ------------------------------------------------------------
// Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------





