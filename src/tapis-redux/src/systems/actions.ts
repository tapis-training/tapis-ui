import { apiCall } from '../sagas/actions';
import * as ACTIONS from './actionTypes';
import { Systems } from '@tapis/tapis-typescript';
import { SystemsListCallback } from './types';
import { Config } from 'tapis-redux/types';

// Create a 'list' dispatch generator
export const list = (config: Config = null, onList: SystemsListCallback = null) => {
  // Generate a dispatch that calls the API saga with
  // a systems listing payload

  // Create a request object
  const request: Systems.GetSystemsRequest = {};
  return apiCall<Systems.RespSystems>({
    // Optional configuration
    config,
    // Optional callback
    onApi: onList,
    // Dispatches to send to notify the Systems reducer
    dispatches: {
      request: ACTIONS.TAPIS_SYSTEMS_LIST_REQUEST,
      success: ACTIONS.TAPIS_SYSTEMS_LIST_SUCCESS,
      failure: ACTIONS.TAPIS_SYSTEMS_LIST_FAILURE
    },
    // Specify which tapis-typescript module to use
    module: Systems,
    // Specify the API constructor
    api: Systems.SystemsApi,
    // Specify the function name to run 
    func: Systems.SystemsApi.prototype.getSystems,
    // Provide the arguments for the function
    args: [request]
  });
};