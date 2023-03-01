import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setChannel } from '../reducer/userReducer';
import './components.css';

const Header = ({ chain }) => {
  const [searchParams] = useSearchParams();
  const channel = useSelector((state) => state.user.channel);
  const dispatch = useDispatch();

  useEffect(() => {
    let store = searchParams.get('storeCode');
    if (store) {
      axios
        .post('/api/store/getUserStore', { storeId: store })
        .then((res) => {
          console.log(res.status, 'store found');
          dispatch(setChannel(res.data.data.name));
          // console.log(res.data.data.name);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [dispatch]);

  useEffect(() => {
    if (chain) {
      dispatch(setChannel(chain));
    }
  }, [chain, dispatch]);

  return (
    <div style={{ paddingTop: '190px' }}>
      <div className="position-absolute">
        <img
          src="https://images.unsplash.com/photo-1612222869049-d8ec83637a3c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1548&q=80"
          alt="logo"
          className="header-logo"
        />

        <div className="header-grid-row">
          <img
            className="promotion"
            src="https://dwzg9hxy3ldn9.cloudfront.net/mt5/assets/Group+22507.png"
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
