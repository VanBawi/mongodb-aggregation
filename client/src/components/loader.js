import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

const ButtonLoader = ({ isLoading, component }) => {
	if (isLoading) {
		return (
			<Spin indicator={<LoadingOutlined style={{ fontSize: "24" }} spin />} />
		);
	} else {
		return component;
	}
};

export default ButtonLoader;