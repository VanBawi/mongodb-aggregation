import Header from '../components/header';
import './view.css';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import IncDecCounter from '../components/IncDecCounter';

const UploadReceipt = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const uploadref = useRef();
  const [imageUrl, setImageUrl] = useState();
  const [imageFile, setImageFile] = useState();
  const [checkImage, setCheckImage] = useState(false);
  const [checkPurchased, setCheckPurchased] = useState(false);
  const [products, setProducts] = useState({
    ensure: 0,
    glucerna: 0,
    isomilPlus: 0,
    pediasureBib: 0,
    pediasureTin: 0,
    pediasure10: 0,
    stc3: 0,
    stc4: 0,
    similacGainKidBib: 0,
    similacGainKidTin: 0,
    similacGainPlusBib: 0,
    similacGainPlusTin: 0,
    similacMom: 0,
    similacComfort: 0,
  });

  function changeQuantity(event, name) {
    let newQuantity = { ...products };

    newQuantity[name] = event; // 1
    setProducts(newQuantity);
    // console.log(newQuantity);
  }

  const onFinish = (values) => {
    if (imageFile && !checkPurchased) {
      setCheckImage(false);
      const allValues = {
        ...values,
        products: products,
        number: location.state.number,
        uri: imageFile,
        filetype: imageFile.type,
      };
      navigate('/submitreceipt', {
        state: { ...location.state, receipt: allValues },
      });
    } else {
      if (!imageFile) {
        setCheckImage(true);
      }
    }
  };

  useEffect(() => {
    let total = 0;

    for (let i in products) {
      total += products[i];
    }

    if (total < 1) {
      setCheckPurchased(true);
    } else {
      setCheckPurchased(false);
    }
  }, [products]);

  // useEffect(() => {
  //   if (!location.state?.number) {
  //     navigate(`/welcome/${location.state?.chain}`);
  //   }
  // }, []);

  const checkRequire = () => {
    let total = 0;

    for (let i in products) {
      total += products[i];
    }

    if (total < 1) {
      setCheckPurchased(true);
    } else {
      setCheckPurchased(false);
    }

    if (imageFile) {
      setCheckImage(false);
    } else {
      setCheckImage(true);
    }
  };

  const handleDisplayImage = (e) => {
    let render = new FileReader();

    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setCheckImage(false);
      render.readAsDataURL(e.target.files[0]);
      render.onload = (res) => {
        setImageUrl(res.target.result);
      };
    }
  };

  const today = new Date()
    .toISOString()
    .replace(/T.*/, '')
    .split('-')
    .join('-');

  return (
    <div>
      <Header />
      <div className="upload-receipt-content">
        <h2 className="upload-receipt-title">{t('uploadReceipt')}</h2>
        <div className="upload-receipt-input-item">
          <p className="upload-receipt-input-title">{t('uploadImage')}</p>
          <div
            className="upload-receipt-input-file-box"
            onClick={() => uploadref.current.click()}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="receipt"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            ) : (
              <div className="upload-receipt-input-file-grid">
                <div className="upload-receipt-input-file-textone">
                  {t('chooseFile')}
                </div>
                <div className="upload-receipt-input-file-texttwo">
                  {t('noFileChoosen')}
                </div>
              </div>
            )}
            <input
              type="file"
              name="receiptImage"
              accept="image/*"
              ref={uploadref}
              onChange={(e) => handleDisplayImage(e)}
              style={{ width: '0px', height: '0px', opacity: '0' }}
              required
            />
          </div>
          {checkImage && (
            <span style={{ color: '#ff4d4f', fontSize: '14px' }}>
              Please upload your receipt image!
            </span>
          )}
        </div>
        <Form className="upload-receipt-form" onFinish={onFinish}>
          <Form.Item
            name="invoiceNo"
            className="upload-receipt-input-item"
            rules={[
              { required: true, message: 'Please enter your receipt no!' },
            ]}
          >
            <div>
              <p className="upload-receipt-input-title">{t('receiptNo')}</p>
              <Input className="upload-receipt-input-field" />
            </div>
          </Form.Item>
          <Form.Item
            name="receiptDate"
            className="upload-receipt-input-item"
            rules={[
              { required: true, message: 'Please enter your receipt date!' },
            ]}
          >
            <div>
              <p className="upload-receipt-input-title">{t('receiptDate')}</p>
              <Input
                className="upload-receipt-input-field"
                type="date"
                max={today}
              />
            </div>
          </Form.Item>
          <Form.Item
            name="amount"
            className="upload-receipt-input-item"
            rules={[
              { required: true, message: 'Please enter your receipt amount!' },
              {
                validator: (_, value) => {
                  if (value >= 500) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject(
                      new Error('The minimum amount required is RM500')
                    );
                  }
                },
              },
            ]}
          >
            <div>
              <p className="upload-receipt-input-title">{t('receiptAmount')}</p>
              <Input type="number" className="upload-receipt-input-field" />
            </div>
          </Form.Item>
          <p
            className="upload-receipt-input-title"
            style={{ margin: '15px 10%' }}
          >
            {t('purchasedUnit')}
          </p>
          <div className="upload-receipt-purchase">
            <div className="upload-receipt-purchase-grid">
              <div>Ensure Gold 850g</div>
              <div>
                <IncDecCounter
                  num={products.ensure}
                  setNum={(e) => changeQuantity(e, 'ensure')}
                />
              </div>
            </div>
            <hr
              style={{
                backgroundColor: '#888B8D',
                borderWidth: '0.1px',
                margin: '12px 0px 12px -10px',
              }}
            />
            <div className="upload-receipt-purchase-grid">
              <div>Glucerna 850g</div>
              <div>
                <IncDecCounter
                  num={products.glucerna}
                  setNum={(e) => changeQuantity(e, 'glucerna')}
                />
              </div>
            </div>
            <hr
              style={{
                backgroundColor: '#888B8D',
                borderWidth: '0.1px',
                margin: '12px 0px 12px -10px',
              }}
            />
            <div className="upload-receipt-purchase-grid">
              <div>Isomil Plus 850g</div>
              <div>
                <IncDecCounter
                  num={products.isomilPlus}
                  setNum={(e) => changeQuantity(e, 'isomilPlus')}
                />
              </div>
            </div>
            <hr
              style={{
                backgroundColor: '#888B8D',
                borderWidth: '0.1px',
                margin: '12px 0px 12px -10px',
              }}
            />
            <div className="upload-receipt-purchase-grid">
              <div className="product">Pediasure 1-10 years old 1.8kg BIB</div>
              <div>
                <IncDecCounter
                  num={products.pediasureBib}
                  setNum={(e) => changeQuantity(e, 'pediasureBib')}
                />
              </div>
            </div>
            <hr
              style={{
                backgroundColor: '#888B8D',
                borderWidth: '0.1px',
                margin: '12px 0px 12px -10px',
              }}
            />
            <div className="upload-receipt-purchase-grid">
              <div className="product">Pediasure 1-10 years old 1.6kg Tin</div>
              <div>
                <IncDecCounter
                  num={products.pediasureTin}
                  setNum={(e) => changeQuantity(e, 'pediasureTin')}
                />
              </div>
            </div>
            <hr
              style={{
                backgroundColor: '#888B8D',
                borderWidth: '0.1px',
                margin: '12px 0px 12px -10px',
              }}
            />
            <div className="upload-receipt-purchase-grid">
              <div className="product">Pediasure 10+ 850g</div>
              <div>
                <IncDecCounter
                  num={products.pediasure10}
                  setNum={(e) => changeQuantity(e, 'pediasure10')}
                />
              </div>
            </div>
            <hr
              style={{
                backgroundColor: '#888B8D',
                borderWidth: '0.1px',
                margin: '12px 0px 12px -10px',
              }}
            />
            <div className="upload-receipt-purchase-grid">
              <div className="product">Similac Gold Gain Plus S3 1.8kg BIB</div>
              <div>
                <IncDecCounter
                  num={products.similacGainPlusBib}
                  setNum={(e) => changeQuantity(e, 'similacGainPlusBib')}
                />
              </div>
            </div>
            <hr
              style={{
                backgroundColor: '#888B8D',
                borderWidth: '0.1px',
                margin: '12px 0px 12px -10px',
              }}
            />
            <div className="upload-receipt-purchase-grid">
              <div className="product">Similac Gold Gain Plus S3 1.8kg Tin</div>
              <div>
                <IncDecCounter
                  num={products.similacGainPlusTin}
                  setNum={(e) => changeQuantity(e, 'similacGainPlusTin')}
                />
              </div>
            </div>
            <hr
              style={{
                backgroundColor: '#888B8D',
                borderWidth: '0.1px',
                margin: '12px 0px 12px -10px',
              }}
            />
            <div className="upload-receipt-purchase-grid">
              <div className="product">
                Similac Gold Gain Kid S4 4 1.8kg BIB
              </div>
              <div>
                <IncDecCounter
                  num={products.similacGainKidBib}
                  setNum={(e) => changeQuantity(e, 'similacGainKidBib')}
                />
              </div>
            </div>
            <hr
              style={{
                backgroundColor: '#888B8D',
                borderWidth: '0.1px',
                margin: '12px 0px 12px -10px',
              }}
            />
            <div className="upload-receipt-purchase-grid">
              <div className="product">
                Similac Gold Gain Kid S4 4 1.8kg Tin
              </div>
              <div>
                <IncDecCounter
                  num={products.similacGainKidTin}
                  setNum={(e) => changeQuantity(e, 'similacGainKidTin')}
                />
              </div>
            </div>
            <hr
              style={{
                backgroundColor: '#888B8D',
                borderWidth: '0.1px',
                margin: '12px 0px 12px -10px',
              }}
            />
            <div className="upload-receipt-purchase-grid">
              <div>Similac Mom 900g</div>
              <div>
                <IncDecCounter
                  num={products.similacMom}
                  setNum={(e) => changeQuantity(e, 'similacMom')}
                />
              </div>
            </div>
            <hr
              style={{
                backgroundColor: '#888B8D',
                borderWidth: '0.1px',
                margin: '12px 0px 12px -10px',
              }}
            />
            <div className="upload-receipt-purchase-grid">
              <div className="product">
                Similac Intelli Pro Step 3 1.2kg BIB
              </div>
              <div>
                <IncDecCounter
                  num={products.stc3}
                  setNum={(e) => changeQuantity(e, 'stc3')}
                />
              </div>
            </div>
            <hr
              style={{
                backgroundColor: '#888B8D',
                borderWidth: '0.1px',
                margin: '12px 0px 12px -10px',
              }}
            />
            <div className="upload-receipt-purchase-grid">
              <div className="product">
                Similac Intelli Pro Step 4 1.2kg BIB
              </div>
              <div>
                <IncDecCounter
                  num={products.stc4}
                  setNum={(e) => changeQuantity(e, 'stc4')}
                />
              </div>
            </div>
            <hr
              style={{
                backgroundColor: '#888B8D',
                borderWidth: '0.1px',
                margin: '12px 0px 12px -10px',
              }}
            />
            <div className="upload-receipt-purchase-grid">
              <div className="product">Similac Total Comfort 820g</div>
              <div>
                <IncDecCounter
                  num={products.similacComfort}
                  setNum={(e) => changeQuantity(e, 'similacComfort')}
                />
              </div>
            </div>
          </div>
          {checkPurchased && (
            <span
              style={{ color: '#ff4d4f', fontSize: '14px', margin: '0px 10%' }}
            >
              Please add at least one purchased unit!
            </span>
          )}
          <Form.Item style={{ margin: '30px 10%' }}>
            <Button
              type="primary"
              htmlType="submit"
              className="upload-receipt-submit-button"
              onClick={checkRequire}
            >
              {t('submit')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default UploadReceipt;
