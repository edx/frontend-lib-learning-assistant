import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { OptimizelyDecideOption } from '@optimizely/react-sdk';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { setExperiments } from '../data/slice';
import optimizely from '../data/optimizely'; // eslint-disable-line no-unused-vars

const useOptimizelyExperiments = async () => {
  const dispatch = useDispatch();
  const { userId } = getAuthenticatedUser();

  await optimizely.onReady();

  useEffect(() => {
    const user = optimizely.createUserContext(userId);
    const decisions = user.decideAll([OptimizelyDecideOption.ENABLED_FLAGS_ONLY]);

    dispatch(setExperiments({ decisions }));
  }, [dispatch, userId]);
};

export default useOptimizelyExperiments;
