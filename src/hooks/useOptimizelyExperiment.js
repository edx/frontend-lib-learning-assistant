import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useDecision } from '@optimizely/react-sdk';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { setExperiment } from '../data/slice';

// We need this import to make sure Optimizely is instantiated.
import optimizelyInstance from '../data/optimizely'; // eslint-disable-line no-unused-vars

const useOptimizelyExperiment = (flag) => {
  const dispatch = useDispatch();
  const { userId } = getAuthenticatedUser();
  const [decision] = useDecision(flag, { autoUpdate: true }, { id: userId });

  useEffect(() => {
    dispatch(setExperiment({ flag, decision }));
  }, [dispatch, flag, decision]);
};

export default useOptimizelyExperiment;
