import Header from '../components/header';
import './view.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';

const StepToRedeem = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div>
      <Header />
      <div className="tng-code-content">
        <div className="step-redeem-box">
          <h2 className="step-redeem-box-title">{t('stepRedeemCode')}</h2>
          <div>
            <div className="step-redeem-box-grid">
              <span className="step-redeem-box-step-number">1</span>
              <span>
                {t('open')}{' '}
                <span style={{ fontWeight: 'bold' }}>{t('tng')}</span>{' '}
                {t('app')}
              </span>
            </div>
            <div className="step-redeem-box-grid">
              <span className="step-redeem-box-step-number">2</span>
              <span>
                {t('click')}{' '}
                <span style={{ fontWeight: 'bold' }}>{t('reload')}</span>
              </span>
            </div>
            <div className="step-redeem-box-grid">
              <span className="step-redeem-box-step-number">3</span>
              <span>
                {t('click')}{' '}
                <span style={{ fontWeight: 'bold' }}>
                  {t('stepTngReloadPin')}
                </span>
              </span>
            </div>
            <div className="step-redeem-box-grid">
              <span className="step-redeem-box-step-number">4</span>
              <span>{t('keyInPin')}</span>
            </div>
            <div className="step-redeem-box-grid">
              <span className="step-redeem-box-step-number">5</span>
              <span>{t('successfullyRedeem')}</span>
            </div>
          </div>
          <Button
            type="primary"
            htmlType="submit"
            className="step-redeem-box-ok-button"
            onClick={() => navigate(-1)}
          >
            OK
          </Button>
          <div className="step-redeem-box-valid">{t('validOneTime')}</div>
        </div>
      </div>
    </div>
  );
};

export default StepToRedeem;
