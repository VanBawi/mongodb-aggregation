import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const translationEn = {
	mobileVerify: "Please enter your mobile number to verify your account",
};

const translationBm = {
	mobileVerify: "Paccount",
};

const resources = {
	en: {
		translation: translationEn,
	},
	bm: {
		translation: translationBm,
	},
};

i18n.use(initReactI18next).init({
	resources,
	lng: localStorage.getItem('language') || 'en',

	interpolation: {
		escapeValue: false,
	},
	fallbackLng: 'en',
});

export default i18n;
