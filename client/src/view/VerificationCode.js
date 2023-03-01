import Header from '../components/header';
import './view.css';
import { useTranslation } from 'react-i18next';
import OtpInput from 'react-otp-input';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Modal } from 'antd';

const VerificationCode = () => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState('');
  const [checkOTP, setCheckOTP] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // console.log('location.state', location.state);

  const handleVerify = (e) => {
    e.preventDefault();

    if (otp.length === 4) {
      setCheckOTP(false);
      axios
        .post('/api/auth/verifyOtp', {
          otp,
          number: location.state.number,
        })
        .then((res) => {
          if (res.data.data.name) {
            navigate('/home', {
              state: {
                ...location.state,
                name: res.data.data.name,
                email: res.data.data.email,
              },
            });
          } else {
            navigate('/registration', { state: location.state });
          }
        })
        .catch((err) => {
          console.error(err);
          error(err.response.data.error);
        });
    } else {
      setCheckOTP(true);
    }
  };

  const handleResendOTP = () => {
    axios
      .post('/api/auth/resend', {
        number: location.state.number,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error(err);
        error(err.response.data.error);
      });
  };

  useEffect(() => {
    if (!location.state?.number) {
      navigate(`/welcome/${location.state?.chain}`);
    }
  }, [location]);

  const error = (msg) => {
    Modal.error({
      title: 'Error',
      content: msg,
    });
  };

  return (
    <div>
      <Header />
      <div className="mobile-verification-content">
        <h1 className="mobile-verification-title">{t('verificationCode')}</h1>
        <p className="mobile-verification-subtitle">
          {t('typeCode')} +6{location.state.number}
        </p>
        <form className="verification-code-form">
          <OtpInput
            value={otp}
            onChange={(e) => setOtp(e)}
            numInputs={4}
            isInputNum={true}
            containerStyle={{
              textAlign: 'center',
              margin: 'auto',
              justifyContent: 'center',
              gap: '10px',
            }}
            inputStyle={{
              width: '55px',
              height: '55px',
              fontSize: '20px',
              border: '2px #C5BEBE solid',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
            focusStyle={{
              outline: 'none',
              border: '2px solid #2197D3',
              borderRadius: '8px',
            }}
            required
          />
          {checkOTP && (
            <p style={{ color: 'red' }}>Please fill in the OTP code</p>
          )}
          <p>
            {t('didntGetOTP')}{' '}
            <span
              style={{ textDecoration: 'underline', color: '#2197D3' }}
              onClick={handleResendOTP}
            >
              {t('resendOTP')}
            </span>
          </p>
          <button
            type="submit"
            className="verification-code-submit-button"
            onClick={handleVerify}
          >
            {t('verify')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerificationCode;
