import React, { Suspense, lazy, useEffect } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import Loading from '../src/components/loading';

//fonts
import './fonts/attachments/Inter-Black.ttf';
import './fonts/attachments/Inter-Bold.ttf';
import './fonts/attachments/Inter-ExtraBold.ttf';
import './fonts/attachments/Inter-ExtraLight.ttf';
import './fonts/attachments/Inter-Light.ttf';
import './fonts/attachments/Inter-Medium.ttf';
import './fonts/attachments/Inter-Regular.ttf';
import './fonts/attachments/Inter-SemiBold.ttf';
import './fonts/attachments/Inter-Thin.ttf';
import i18n from './config/i18n';

const Home = lazy(() => import('./view/Home'));
const MobileVerification = lazy(() => import('./view/MobileVerification'));
const VerificationCode = lazy(() => import('./view/VerificationCode'));
const Registration = lazy(() => import('./view/Registration'));
const UploadReceipt = lazy(() => import('./view/UploadReceipt'));
const SubmitReceipt = lazy(() => import('./view/SubmitReceipt'));
const Reward = lazy(() => import('./view/Reward'));
const TngCode = lazy(() => import('./view/TngCode'));
const StepToRedeem = lazy(() => import('./view/StepToRedeem'));

function App() {
  useEffect(() => {
    i18n.changeLanguage('en');
  }, []);

  return (
    <div className="App">
      <Suspense fallback={<Loading />}>
        <Router>
          <Routes>
            <Route exact path="/home" element={<Home />} />

            <Route path="/welcome" element={<MobileVerification />} />
            <Route path="/welcome/:chain" element={<MobileVerification />} />
            <Route
              exact
              path="/welcome/:chain/:storeCode"
              element={<MobileVerification />}
            />
            <Route
              exact
              path="/verification/code"
              element={<VerificationCode />}
            />
            <Route exact path="/registration" element={<Registration />} />
            <Route exact path="/uploadreceipt" element={<UploadReceipt />} />
            <Route exact path="/submitreceipt" element={<SubmitReceipt />} />
            <Route exact path="/reward" element={<Reward />} />
            <Route exact path="/tngcode" element={<TngCode />} />
            <Route exact path="/steptoredeem" element={<StepToRedeem />} />

            <Route path="*" element={<Navigate to="/welcome" />}></Route>
          </Routes>
        </Router>
      </Suspense>
    </div>
  );
}

export default App;
