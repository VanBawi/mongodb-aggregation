import '../App.css';

function IncDecCounter({ num, setNum }) {
  let incNum = () => {
    setNum(Number(num) + 1);
  };
  let decNum = () => {
    if (num >= 1) {
      setNum(num - 1);
    }
  };

  return (
    <>
      <div className="col-xl-1">
        <div className="d-flex input-group number-box">
          <div className="input-group-prepend ">
            <button className="btn-minus" type="button" onClick={decNum}>
              -
            </button>
          </div>
          <input
            type="number"
            className="form-control"
            value={num}
            disabled
            onChange={(e) => setNum(e.target.value)}
            style={{
              width: '38px',
              textAlign: 'center',
              borderWidth: '0px',
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              boxShadow: 'none',
              color: 'black',
            }}
          />
          <div className="input-group-prepend">
            <button
              className="btn-plus"
              type="button"
              onClick={incNum}
              style={{ marginRight: '10px' }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default IncDecCounter;
