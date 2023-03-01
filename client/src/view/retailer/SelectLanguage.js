import Header from '../../components/header';
import '../view.css';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import i18n from '../../config/i18n';
import { useEffect } from 'react';
import { Modal } from 'antd';

const SelectLanguage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const changeToLang = (language) => {
    if (!searchParams.get('storeCode')) {
      error();
    } else {
      localStorage.setItem('retailerLanguage', language);
      i18n.changeLanguage(language);
      navigate(`/storeperformance?storeCode=${searchParams.get('storeCode')}`);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('retailerLanguage')) {
      localStorage.setItem('retailerLanguage', 'en');
    }
    if (!searchParams.get('storeCode')) {
      error();
    }
  }, []);

  const error = () => {
    Modal.error({
      title: 'Error',
      content: 'Please scan the store qr code to register.',
    });
  };

  return (
    <div>
      <Header />
      <div className="select-language-content">
        <h2 className="select-language-title">{t('selectLang')}</h2>
        <div className="select-language-grid">
          <button
            className="select-language-button"
            onClick={() => changeToLang('en')}
          >
            English
          </button>
          <button
            className="select-language-button"
            onClick={() => changeToLang('zh')}
          >
            中文
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectLanguage;
