import './components.css';

const Info = ({ receiptNo, receiptDate, receiptAmount, pediasureUnit, plusUnit, kidUnit }) => {
	return (
		<div className='info-main-container'>
			<div className='info-box'>
				<h4 className='info-title'>Receipt No:</h4>
				<p className='info-text'>{receiptNo}</p>
			</div>
			<div className='info-box'>
				<h4 className='info-title'>Receipt Date:</h4>
				<p className='info-text'>{receiptDate}</p>
			</div>
			<div className='info-box'>
				<h4 className='info-title'>Receipt Amount:</h4>
				<p className='info-text'>{receiptAmount}</p>
			</div>
			<div className='info-box'>
				<h4 className='info-title'>Pediasure:</h4>
				<p className='info-text'>{pediasureUnit}</p>
			</div>
			<div className='info-box'>
				<h4 className='info-title'>Similac Gold Gain Plus:</h4>
				<p className='info-text'>{plusUnit}</p>
			</div>
			<div className='info-box'>
				<h4 className='info-title'>Similac Gold Gain Kid:</h4>
				<p className='info-text'>{kidUnit}</p>
			</div>
		</div>
	);
};

export default Info;
