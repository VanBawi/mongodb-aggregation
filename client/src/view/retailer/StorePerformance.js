import Header from '../../components/header';
import '../view.css';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const StorePerformance = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [storeData, setStoreData] = useState({});

  useEffect(() => {
    axios
      .post('/api/store/getStoreById', {
        storeId: searchParams.get('storeCode'),
      })
      .then((res) => {
        setStoreData(res.data.data);
      })
      .catch((err) => {
        console.error(err);
      });
  });

  return (
    <div>
      <Header />
      <div className="store-performance-content">
        <h2 className="store-performance-title">Store Performance Overview</h2>
        <div className="store-performance-box">
          <div className="store-performance-box-top">
            <span>{storeData?.storeName}</span>
            <br />
            <span>STORE CODE: {storeData?.storeCode}</span>
          </div>
          <div className="store-performance-box-bottom">
            <div className="store-performance-grid">
              <span>{t('numSold')}</span>
              <span className="store-performance-box-bottom-amount">
                {storeData?.totalUnitSold}
              </span>
            </div>
            <hr className="store-performance-hr" />
            <div className="store-performance-grid">
              <span>{t('totalPurhcase')}</span>
              <span className="store-performance-box-bottom-amount">
                {storeData?.totalCompletedSubscribers}
              </span>
            </div>
            <hr className="store-performance-hr" />
            <div className="store-performance-grid">
              <span>{t('UTDIncentives')}</span>
              <span className="store-performance-box-bottom-amount">
                RM{storeData?.incentive}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePerformance;
