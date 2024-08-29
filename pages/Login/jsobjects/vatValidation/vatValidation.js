export default {
	validateVAT() {
		const nif = inp_VAT.text;
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
	}
};

