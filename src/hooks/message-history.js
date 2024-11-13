/* eslint-disable import/prefer-default-export */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLearningAssistantMessageHistory } from '../data/thunks';

export const useMessageHistory = (courseId) => {
  const dispatch = useDispatch();
  const { isEnabled } = useSelector(state => state.learningAssistant);

  useEffect(() => {
    if (!courseId || !isEnabled) { return; }

    dispatch(getLearningAssistantMessageHistory(courseId));
  }, [dispatch, isEnabled, courseId]);
};
