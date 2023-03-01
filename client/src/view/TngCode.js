import Header from '../components/header';
import './view.css';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CheckOutlined } from '@ant-design/icons';

const TngCode = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkCopy, setCheckCopy] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(location.state.code);
    setCheckCopy(true);
  };

  useEffect(() => {
    if (!location.state?.number) {
      navigate(`/welcome/${location.state?.chain}`);
    }
  }, []);

  return (
    <div>
      <Header />
      <div className="tng-code-content">
        <div className="tng-code-box">
          <h2 className="tng-code-box-title">{t('tngCode')}</h2>
          <div className="tng-code-box-grid">
            <span className="tng-code-box-grid-code">
              {location.state.code}
            </span>
            <div
              className="tng-code-box-grid-copy-box"
              onClick={copyToClipboard}
            >
              {checkCopy ? (
                <CheckOutlined style={{ color: 'white', fontSize: '24px' }} />
              ) : (
                <img
                  src="https://dwzg9hxy3ldn9.cloudfront.net/cmh_retention3/images/copy-icon.png"
                  alt="copy icon"
                />
              )}
            </div>
          </div>
          <Link className="tng-code-box-how-redeem" to="/steptoredeem">
            <span className="tng-code-box-how-redeem-question">?</span>{' '}
            {t('howRedeem')}
          </Link>
          <div className="tng-code-box-term">{t('termAndConApply')}</div>
        </div>
      </div>
    </div>
  );
};

export default TngCode;
