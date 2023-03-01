import Header from '../components/header';
import './view.css';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Resizer from 'react-image-file-resizer';
import Loader from '../components/loader';

const SubmitReceipt = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const uploadref = useRef();
  const [imageUrl, setImageUrl] = useState();
  const [imageFile, setImageFile] = useState();
  const [showModal, setShowModal] = useState(false);
  const [load, setLoad] = useState(false);

  const onFinish = () => {
    setLoad(true);
    let receiptData = location.state.receipt;
    Resizer.imageFileResizer(imageFile, 800, 800, 'PNG', 30, 0, (uri) => {
      receiptData.uri = uri;
      receiptData.filetype = imageFile.type;
      axios
        .post('/api/upload/receipt', receiptData)
        .then((res) => {
          setShowModal(true);
        })
        .catch((err) => {
          // console.log('err', err.response.data);
          error(err.response.data.error);
          setLoad(false);
        });
    });
  };

  useEffect(() => {
    if (!location.state?.number) {
      navigate(`/welcome/${location.state?.chain}`);
    }

    let render = new FileReader();

    if (location.state?.receipt?.uri) {
      setImageFile(location.state.receipt.uri);
      render.readAsDataURL(location.state.receipt.uri);
      render.onload = (res) => {
        setImageUrl(res.target.result);
      };
    }
    console.log(location.state);
  }, []);

  const handleDisplayImage = (e) => {
    let render = new FileReader();

    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      render.readAsDataURL(e.target.files[0]);
      render.onload = (res) => {
        setImageUrl(res.target.result);
      };
    }
  };

  const error = (msg) => {
    Modal.error({
      title: 'Error',
      content: msg,
    });
  };

  return (
    <div>
      <Header />
      <div className="submit-receipt-content">
        <h2 className="submit-receipt-title">{t('submitReceipt')}</h2>
        <div className="submit-receipt-input-title">{t('uploadPreview')}</div>
        <div className="submit-receipt-preview-box">
          <img
            src={imageUrl}
            alt="receipt"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'block',
              margin: 'auto',
            }}
          />
          <div
            className="submit-receipt-reupload"
            onClick={() => uploadref.current.click()}
          >
            {t('reupload')}
          </div>
          <form style={{ width: '0px', height: '0px' }}>
            <input
              type="file"
              name="receiptImage"
              accept="image/jpg,image/jpeg,image/png"
              ref={uploadref}
              onChange={(e) => handleDisplayImage(e)}
              style={{ width: '0px', height: '0px', opacity: '0' }}
            />
          </form>
        </div>
        <div className="submit-receipt-make-sure">
          <div>{t('makeSure')}</div>
          <div className="submit-receipt-make-sure-grid">
            <img
              src="https://dwzg9hxy3ldn9.cloudfront.net/cmh_retention3/images/tick.png"
              alt="tick"
            />
            <div>{t('frameCover')}</div>
          </div>
          <div className="submit-receipt-make-sure-grid">
            <img
              src="https://dwzg9hxy3ldn9.cloudfront.net/cmh_retention3/images/tick.png"
              alt="tick"
            />
            <div>{t('seenClearly')}</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '1rem', margin: '0 1%' }}>
          {t('failureToDo')}
        </div>
        <Loader
          isLoading={load}
          component={
            <Button
              type="primary"
              htmlType="submit"
              className="submit-receipt-submit-button"
              onClick={onFinish}
            >
              {t('submit')}
            </Button>
          }
        />
      </div>
      <Modal
        visible={showModal}
        footer={null}
        closable={false}
        className="submit-receipt-modal"
        centered
      >
        <img
          src="https://dwzg9hxy3ldn9.cloudfront.net/cmh_retention3/images/tickimage.png"
          alt="tick"
          className="submit-receipt-modal-tick"
        />
        <img
          src="https://dwzg9hxy3ldn9.cloudfront.net/cmh_retention3/images/close.png"
          alt="close"
          className="submit-receipt-modal-close"
          onClick={() => navigate(-2)}
        />
        <h2 className="submit-receipt-modal-title">{t('uploadSuccess')}</h2>
        <div className="submit-receipt-modal-text">{t('thankYouUpload')}</div>
      </Modal>
    </div>
  );
};

export default SubmitReceipt;
