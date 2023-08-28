import { useDispatch } from 'react-redux';
import { Alert } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import {
  clearApiError,
} from '../../data/thunks';

const APIError = () => {
  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(clearApiError());
  };

  return (
    <Alert
      variant="danger"
      icon={Info}
      dismissible
      onClose={handleClose}
    >
      <Alert.Heading>
        Xpert is unavailable
      </Alert.Heading>
      <p>
        Please try again by sending another question.
      </p>
    </Alert>
  );
};

export default APIError;
