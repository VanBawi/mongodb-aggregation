export const truncateText = (text, length) => (text.length > length ? text.substr(0, length) + "......" : text);

export const checkInputFormat = (data, callback) => {
	const { name, number } = data;
	let field = null;
	let message = null;
	let result = true;

	if (name) {
		const nameRegex = /^[a-zA-Z ]*$/;
		if (!nameRegex.test(name)) {
			field = "name";
			message = 'Please avoid using special characters in "Name" input field';
			result = false;
		}
	}
	if (number) {
		const numberRegex = /^(01)[0-46-9]*[0-9]{8,9}$/;
		if (!numberRegex.test(number) || number.length > 11) {
			field = "number";
			message = "You have entered an invalid phone number";
			result = false;
		}
	}
	

	callback(result, { field, message });
};
