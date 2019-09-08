import {
      ADD_EVENT,
      ADD_EVENT_ROLLBACK,
      DELETE_EVENT,
      DELETE_EVENT_ROLLBACK,
      EDIT_EVENT_NAME,
      EDIT_EVENT_NAME_ROLLBACK,
      SYNC_EVENT_NAME,
      EDIT_EVENT_DATE,
      EDIT_EVENT_DATE_ROLLBACK,
      EDIT_EVENT_START_TIME,
      EDIT_EVENT_END_TIME,
      EDIT_EVENTS_POSITION,
      EDIT_EVENTS_POSITION_ROLLBACK
} from '../actions/eventAction';

function events(state = {}, action) {
      switch (action.type) {
            case ADD_EVENT:
                  return {
                        ...state,
                        [action.payload.id]: {
                              ...action.payload.event,
                              id: action.payload.id,
                              uid: action.payload.uid,
                              type: action.payload.type,
                              period: action.payload.period
                        }
                  };
            case ADD_EVENT_ROLLBACK:
                  let stateToRollback = Object.assign({}, state);
                  stateToRollback[action.meta.id] = Object.assign({}, state[action.meta.id]);
                  delete stateToRollback[action.meta.id];

                  return {
                        ...stateToRollback
                  };
            case EDIT_EVENT_NAME:
                  return {
                        ...state,
                        [action.payload.id]: {
                              ...state[action.payload.id],
                              name: action.payload.name
                        }
                  };
            case EDIT_EVENT_NAME_ROLLBACK:
                  return {
                        ...state,
                        [action.meta.id]: {
                              ...state[action.meta.id],
                              name: action.meta.previousName
                        }
                  };
            case SYNC_EVENT_NAME:
                  return {
                        ...state,
                        [action.id]: {
                              ...state[action.id],
                              name: action.name
                        }
                  };

            case DELETE_EVENT:
                  let newState = Object.assign({}, state);
                  newState[action.payload.id] = Object.assign({}, state[action.payload.id]);
                  delete newState[action.payload.id];

                  // console.log(newState);

                  return {
                        ...newState
                  };
            case DELETE_EVENT_ROLLBACK:
                  return {
                        ...state,
                        [action.meta.id]: { ...action.meta.event }
                  };

            case EDIT_EVENT_DATE:
                  return {
                        ...state,
                        [action.payload.id]: {
                              ...state[action.payload.id],
                              date: action.payload.date,
                              position: -1
                        }
                  };
            case EDIT_EVENT_START_TIME:
                  return {
                        ...state,
                        [action.payload.id]: {
                              ...state[action.payload.id],
                              time: action.payload.time,
                              endTime: action.payload.endTime,
                              position: -1,
                              period: action.payload.period
                        }
                  };
            case EDIT_EVENT_END_TIME:
                  return {
                        ...state,
                        [action.payload.id]: {
                              ...state[action.payload.id],
                              endTime: action.payload.endTime,
                              position: -1
                        }
                  };
            case EDIT_EVENTS_POSITION:
                  return {
                        ...state,
                        [action.payload.id]: {
                              ...state[action.payload.id],
                              position: action.payload.position
                        }
                  };
            default:
                  return state;
      }
}

export default events;
