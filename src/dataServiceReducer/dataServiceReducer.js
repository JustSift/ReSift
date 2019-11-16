import actions from './actionsReducer';
import shared from './sharedReducer';

export default (state, action) => ({
  ...state,
  actions: actions(state && state.actions, action),
  shared: shared(state && state.shared, action),
});
