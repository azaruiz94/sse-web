import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import applicantsReducer from './slices/applicantsSlice';
import statesReducer from './slices/statesSlice';
import dependenciesReducer from './slices/dependencies';
import usersReducer from './slices/usersSlice';
import rolesReducer from './slices/rolesSlice';
import permissionsReducer from './slices/permissionsSlice';
import templatesReducer from './slices/templatesSlice';
import recordsReducer from './slices/recordsSlice';

// Combine all reducers
const appReducer = combineReducers({
  applicants: applicantsReducer,
  auth: authReducer,
  states: statesReducer,
  dependencies: dependenciesReducer,
  users: usersReducer,
  roles: rolesReducer,
  permissions: permissionsReducer,
  templates: templatesReducer,
  records: recordsReducer
});

// Reset state on logout
const rootReducer = (state, action) => {
  if (action.type === 'auth/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});
export default store;