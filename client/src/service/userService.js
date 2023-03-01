import axios from 'axios';

const userAPIs = {
	register: '/api/auth/checkUser',
	verifyOtp: '/api/auth/verifyOtp',
	uploadreceipt: '/api/upload/uploadreceipt',
	resendOtp: '/api/auth/resend',
};

export const registerUser = (data, callback) =>
	axios
		.post(userAPIs.register, data)
		.then((res) => callback(null, res.data))
		.catch((err) => callback(err.response.data.error));

export const verifyOtp = (data, callback) =>
	axios
		.post(userAPIs.verifyOtp, data)
		.then((res) => callback(null, res.data))
		.catch((err) => callback(err.response.data.error));

export const resendOtp = (data, callback) =>
	axios
		.post(userAPIs.resendOtp, data)
		.then((res) => callback(null, res.data))
		.catch((err) => callback(err.response.data.error));

export const uploadreceipt = (data, callback) =>
	axios
		.post(userAPIs.uploadreceipt, data)
		.then((res) => callback(null, res.data))
		.catch((err) => callback(err.response.data.error));
