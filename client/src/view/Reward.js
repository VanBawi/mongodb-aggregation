import Header from '../components/header';
import './view.css';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Reward = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [rewardData, setRewardData] = useState([]);
  const [pendingReceipt, setPendingReceipt] = useState([]);
  const [rejectedReceipts, setRejectedReceipts] = useState([]);

  useEffect(() => {
    if (!location.state?.number) {
      navigate(`/welcome/${location.state?.chain}`);
    }

    axios
      .post('/api/upload/getRewards', { number: location.state.number })
      .then((res) => {
        // console.log(res.data.data);
        setRewardData(res.data.data);
        setPendingReceipt(res.data.pendingReceipts);
        setRejectedReceipts(res.data.rejectedReceipts);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleRedeem = (reward) => {
    if (!reward.redeemed) {
      axios
        .post('/api/upload/updateReward', {
          rewardId: reward._id,
          number: location.state.number,
        })
        .then((res) => {
          navigate('/tngcode', {
            state: { ...location.state, code: reward.code },
          });
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      navigate('/tngcode', {
        state: { ...location.state, code: reward.code },
      });
    }
  };

  // console.log(rewardData);

  return (
    <div>
      <Header />
      <div className="reward-content">
        <h2 className="reward-title">{t('reward')}</h2>
        <div style={{ marginTop: '15px' }}>
          {rewardData.length
            ? rewardData.map((reward) => {
                return (
                  <div
                    className="reward-redeem-box"
                    onClick={() => {
                      handleRedeem(reward);
                    }}
                  >
                    <div className="reward-redeem-box-top">
                      <img
                        src="https://dwzg9hxy3ldn9.cloudfront.net/cmh_retention3/images/tng-logo.png"
                        alt="tng logo"
                        style={{
                          width: '80%',
                          margin: 'auto',
                          padding: '10px 0',
                        }}
                      />
                      <div style={{ margin: '10px 10px 10px 5px' }}>
                        <div className="reward-redeem-box-reward-name">
                          {reward.amount === 25 ? t('tngRM25') : t('tngRM60')}
                        </div>
                        <div className="reward-redeem-box-expire-date">
                          {t('expire')}
                        </div>
                      </div>
                    </div>
                    {reward.redeemed ? (
                      <div className="reward-redeem-box-bottom-redeemed">
                        {t('redeemed')}
                      </div>
                    ) : (
                      <div className="reward-redeem-box-bottom">
                        {t('redeemNow')}
                      </div>
                    )}
                  </div>
                );
              })
            : null}
        </div>
        {!rewardData.length !== 2 && pendingReceipt.length
          ? pendingReceipt.map((each) => {
              return (
                <div
                  className="reward-redeem-box"
                  style={{ cursor: 'default' }}
                >
                  <div
                    className="reward-redeem-box-top"
                    style={{ cursor: 'default' }}
                  >
                    <img
                      src="https://dwzg9hxy3ldn9.cloudfront.net/cmh_retention3/images/tng-logo.png"
                      alt="tng logo"
                      style={{
                        width: '80%',
                        margin: 'auto',
                        padding: '10px 0',
                      }}
                    />
                    <div style={{ margin: '10px 10px 10px 5px' }}>
                      <div className="reward-redeem-box-reward-name">
                        {t('tngWallet')}
                      </div>
                      <div className="reward-redeem-box-expire-date">
                        Expires in
                        <span style={{ fontWeight: 'bold' }}>
                          {' '}
                          2 January 2023
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="reward-redeem-box-bottom-redeemed">
                    {t('pending')}
                  </div>
                </div>
              );
            })
          : null}

        {!rewardData.length !== 2 && rejectedReceipts.length
          ? rejectedReceipts.map((each) => {
              return (
                <div
                  className="reward-redeem-box"
                  style={{ cursor: 'default' }}
                >
                  <div
                    className="reward-redeem-box-top"
                    style={{ cursor: 'default' }}
                  >
                    <img
                      src="https://dwzg9hxy3ldn9.cloudfront.net/cmh_retention3/images/tng-logo.png"
                      alt="tng logo"
                      style={{
                        width: '80%',
                        margin: 'auto',
                        padding: '10px 0',
                      }}
                    />
                    <div style={{ margin: '10px 10px 10px 5px' }}>
                      <div className="reward-redeem-box-reward-name">
                        {t('tngWallet')}
                      </div>
                      <div className="reward-redeem-box-expire-date"></div>
                    </div>
                  </div>
                  <div
                    onClick={() =>
                      navigate('/uploadreceipt', {
                        state: { ...location.state },
                      })
                    }
                  >
                    <div className="reward-redeem-box-bottom-redeemed">
                      Resubmit
                    </div>
                  </div>
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
};

export default Reward;
