/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useEffect, useRef } from 'react';
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
  const alertRef = useRef();

  useEffect(() => {
    if (alertRef.current) {
      alertRef.current.focus();
    }
  }, []);

  return (
    <Alert
      variant="danger"
      icon={Info}
      dismissible
      onClose={handleClose}
    >
      <div ref={alertRef} tabIndex="0" data-testid="alert-heading">
        <Alert.Heading>
          Xpert is unavailable
        </Alert.Heading>
      </div>
      <p>
        Please try again by sending another question.
      </p>
    </Alert>
  );
};

export default APIError;
