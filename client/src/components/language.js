import React, { useEffect, useState } from 'react';
import i18n from '../utilities/i18n';

const Languagebar = () => {
	const [lang, setLang] = useState(localStorage.getItem('languageBBC') || 'en');

	useEffect(() => {
		if (lang) {
			i18n.changeLanguage(lang);
			setLang(lang);
			localStorage.setItem('languageBBC', lang);
		}
	}, []);

	const selectlanguage = (lang) => {
		i18n.changeLanguage(lang);
		setLang(lang);
		localStorage.setItem('languageBBC', lang);
	};

	return (
		<div style={{ top: '0%' }}>
			<div className='d-flex justify-content-between header-icons align-items-center'>
				<div
					className='d-flex align-items-center'
					style={{
						width: '100%',
						position: 'fixed',
						zIndex: '11',
						margin: '10px',
						top: '2%',
					}}>
					<button className='language-button'>
						<img src="https://dwzg9hxy3ldn9.cloudfront.net/cmh_retention3/images/language.png" alt='language' />
					</button>
					<button onClick={() => selectlanguage('en')} className={lang}>
						ENG
					</button>
					<button onClick={() => selectlanguage('bm')} className={lang}>
						BM
					</button>
				</div>
			</div>
		</div>
	);
};

export default Languagebar;
