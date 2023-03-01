import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ReactWhatsapp from 'react-whatsapp';
import Draggable from 'react-draggable';
import './view.css';
import i18n from '../config/i18n';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    i18n.changeLanguage('en');
    if (!location.state?.number) {
      navigate(`/welcome/${location.state?.chain}`);
    }
  }, [location.state]);

  return (
    <div className="home-background">
      <img
        src="https://images.unsplash.com/photo-1612222869049-d8ec83637a3c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1548&q=80"
        alt="logo"
        className="home-logo"
      />

      <div className="home-content">
        <div className="img-wrapper" style={{ placeItems: 'center' }}>
          <img
            src="https://dwzg9hxy3ldn9.cloudfront.net/mt5/assets/Group+22508.png"
            alt="promotion"
            className="home-promotion"
          />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              style={{
                objectFit: 'contain',
                marginTop: '-15rem',
              }}
              src="https://dwzg9hxy3ldn9.cloudfront.net/mt5/assets/Campaign+Duration_.png"
              alt="duration"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}></div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              style={{
                objectFit: 'contain',
                marginTop: '-5rem',
              }}
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9wPXAehb41TarUgEKYFG474piIMCO_WY5xA&usqp=CAU"
              alt="sku"
              className="home-promotion3"
            />
          </div>
        </div>
        <div
          style={{
            zIndex: '100',
            top: '45%',
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '500px',
          }}
        >
          x
          <Draggable axis="y">
            <div style={{ float: 'right' }}>
              <ReactWhatsapp
                number="+60182548024"
                style={{ border: 'none', background: 'transparent' }}
              >
                <img
                  src="https://dwzg9hxy3ldn9.cloudfront.net/cmh_retention3/images/whatappicon.png"
                  alt="whatsapp"
                  style={{ objectFit: 'contain', height: '5rem' }}
                />
              </ReactWhatsapp>
            </div>
          </Draggable>
        </div>
        <div style={{ margin: '60px 10px 50px' }}>
          <img
            style={{ maxWidth: '100%' }}
            src="https://dwzg9hxy3ldn9.cloudfront.net/mt5/assets/Group+22510.png"
            alt="reward"
          />
        </div>
        <div
          className="home-btn-bg"
          onClick={() => navigate('/uploadreceipt', { state: location.state })}
        >
          <img
            src="https://dwzg9hxy3ldn9.cloudfront.net/cmh_retention3/images/en-upload.png"
            alt="upload receipt button"
          />
        </div>
        <div
          className="home-btn-bg"
          onClick={() => navigate('/reward', { state: location.state })}
        >
          <img
            src="https://dwzg9hxy3ldn9.cloudfront.net/cmh_retention3/images/en-rewards.png"
            alt="rewards button"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
