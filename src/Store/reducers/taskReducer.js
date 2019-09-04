import {
      RECEIVE_TASKS,
      ADD_TASK,
      ADD_TASK_ROLLBACK,
      DELETE_TASK,
      DELETE_TASK_ROLLBACK,
      EDIT_TASK_NAME,
      EDIT_TASK_NAME_ROLLBACK,
      SYNC_TASK_NAME,
      EDIT_TASK_COMPLETION,
      EDIT_TASK_COMPLETION_ROLLBACK,
      EDIT_TASK_DATE,
      EDIT_TASK_DATE_ROLLBACK,
      EDIT_TASK_TIME,
      EDIT_TASK_TIME_ROLLBACK,
      EDIT_TASKS_POSITION,
      EDIT_TASKS_POSITION_ROLLBACK
} from '../actions/taskAction';

function tasks(state = {}, action) {
      switch (action.type) {
            case RECEIVE_TASKS:
                  return {
                        ...state,
                        ...action.payload.tasks
                  };
            case ADD_TASK:
                  return {
                        ...state,
                        [action.payload.id]: { ...action.payload.task, id: action.payload.id, uid: action.payload.uid }
                  };
            case ADD_TASK_ROLLBACK:
                  let stateToRollback = Object.assign({}, state);
                  stateToRollback[action.meta.id] = Object.assign({}, state[action.meta.id]);
                  delete stateToRollback[action.meta.id];

                  return {
                        ...stateToRollback
                  };
            case EDIT_TASK_NAME:
                  return {
                        ...state,
                        [action.payload.id]: {
                              ...state[action.payload.id],
                              name: action.payload.name
                        }
                  };
            case EDIT_TASK_NAME_ROLLBACK:
                  return {
                        ...state,
                        [action.meta.id]: {
                              ...state[action.meta.id],
                              name: action.meta.previousName
                        }
                  };
            case SYNC_TASK_NAME:
                  return {
                        ...state,
                        [action.id]: {
                              ...state[action.id],
                              name: action.name
                        }
                  };
            case EDIT_TASK_COMPLETION:
                  return {
                        ...state,
                        [action.payload.id]: {
                              ...state[action.payload.id],
                              completed: !action.payload.completion
                        }
                  };

            case EDIT_TASK_COMPLETION_ROLLBACK:
                  return {
                        ...state,
                        [action.meta.id]: {
                              ...state[action.meta.id],
                              completed: action.meta.completion
                        }
                  };
            case DELETE_TASK:
                  let newState = Object.assign({}, state);
                  newState[action.payload.id] = Object.assign({}, state[action.payload.id]);
                  delete newState[action.payload.id];

                  // console.log(newState);

                  return {
                        ...newState
                  };
            case DELETE_TASK_ROLLBACK:
                  return {
                        ...state,
                        [action.meta.id]: { ...action.meta.task }
                  };

            case EDIT_TASK_DATE:
                  return {
                        ...state,
                        [action.payload.id]: {
                              ...state[action.payload.id],
                              date: action.payload.date
                        }
                  };
            case EDIT_TASK_TIME:
                  return {
                        ...state,
                        [action.payload.id]: {
                              ...state[action.payload.id],
                              time: action.payload.time,
                              position: -1
                        }
                  };
            case EDIT_TASKS_POSITION:
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

export default tasks;
