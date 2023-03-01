import Header from '../components/header';
import './view.css';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Modal } from 'antd';
import { useEffect, useState } from 'react';
import i18n from '../config/i18n';

const MobileVerification = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [storeChain, setStoreChain] = useState('');
  const { chain, storeCode } = useParams();

  useEffect(() => {
    i18n.changeLanguage('en');
    localStorage.setItem('test', 'test');
  }, []);

  useEffect(() => {
    if (chain) {
      if (window.location.pathname.includes('welcome/')) {
      }
    }
  }, [chain]);

  const onFinish = (values) => {
    const allValues = {
      ...values,
      storeId: storeCode,
      chain: storeChain, // general users
    };

    axios
      .post('/api/auth/checkUser', allValues)
      .then((res) => {
        // console.log('res.data.data', res.data.data);
        navigate('/verification/code', { state: allValues });
      })
      .catch((err) => {
        console.error(err);
        error(err.response.data.error);
      });
  };

  const error = (msg) => {
    Modal.error({
      title: 'Error',
      content: msg,
    });
  };

  return (
    <div>
      <Header chain={storeChain} />
      <div className="mobile-verification-content">
        <h2 className="mobile-verification-title">{t('mobileVerification')}</h2>
        <p className="mobile-verification-subtitle">{t('enterMobileNum')}</p>
        <Form className="mobile-verification-form" onFinish={onFinish}>
          <Form.Item
            name="number"
            rules={[
              { required: true, message: 'Please enter your phone number!' },
              {
                validator: (_, value) => {
                  var regex = /^(\+?01)[02-46-9][0-9]{7}$|^(\+?01)[1][0-9]{8}$/;
                  if (regex.test(value)) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject(
                      new Error('Enter valid phone number!')
                    );
                  }
                },
              },
            ]}
          >
            <div>
              <p className="mobile-verification-phone-number">
                {t('phoneNumber')}
                <span style={{ color: 'red' }}>*</span>
              </p>
              <Input className="mobile-verification-phone-number-input" />
            </div>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="mobile-verification-submit-button"
            >
              {t('sendOTP')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default MobileVerification;
