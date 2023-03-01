import Header from '../components/header';
import './view.css';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, Form, Input, Checkbox } from 'antd';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Registration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const channel = useSelector((state) => state.user.channel);

  const onFinish = (values) => {
    const allValues = {
      ...values,
      ...location.state,
    };

    axios
      .post('/api/auth/updateUser', allValues)
      .then((res) => {
        navigate('/home', { state: allValues });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div>
      <Header />
      <div className="mobile-verification-content">
        <h2 className="mobile-verification-title">{t('registration')}</h2>
        <Form className="registration-form" onFinish={onFinish}>
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please enter your name!' }]}
          >
            <div>
              <p className="registration-input-title">
                {t('name')}
                <span style={{ color: 'red' }}>*</span>
              </p>
              <Input className="registration-input-field" />
            </div>
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { type: 'email', message: 'Please enter a valid email address!' },
            ]}
          >
            <div>
              <p className="registration-input-title">{t('emailAddress')}</p>
              <Input className="registration-input-field" />
            </div>
          </Form.Item>
          <Form.Item
            name="checkboxOne"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error('Should accept agreement')),
              },
            ]}
          >
            <div className="registration-checkbox-grid">
              <Checkbox />
            </div>
          </Form.Item>
          <Form.Item
            name="checkboxTwo"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error('Should accept agreement')),
              },
            ]}
          >
            <div className="registration-checkbox-grid">
              <Checkbox />
              <p className="registration-checkbox-text">{t('authoriseAbb')}</p>
            </div>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="registration-submit-button"
            >
              {t('register')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Registration;
