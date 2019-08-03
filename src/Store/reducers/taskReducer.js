import {
      RECEIVE_TASKS,
      ADD_TASK,
      DELETE_TASK,
      EDIT_TASK_NAME,
      EDIT_TASK_DATE,
      EDIT_TASK_TIME,
      EDIT_TASKS_POSITION
} from '../actions/taskAction';

function tasks(state = {}, action) {
      switch (action.type) {
            case RECEIVE_TASKS:
                  return {
                        ...state,
                        ...action.tasks
                        // [action.date]: {
                        //       ...state[action.date],
                        //       ...action.tasks
                        // }
                  };
            case ADD_TASK:
                  return {
                        ...state,
                        [action.id]: action.task
                        // tasks: {
                        //       ...state.tasks,
                        //       [action.id]: action.task
                        // }
                  };
            case EDIT_TASK_NAME:
                  return {
                        ...state,
                        [action.id]: {
                              ...state[action.id],
                              name: action.name
                        }
                  };
            case DELETE_TASK:
                  let newState = Object.assign({}, state);
                  newState[action.id] = Object.assign({}, state[action.id]);
                  delete newState[action.id];

                  return {
                        ...newState
                  };
            case EDIT_TASK_DATE:
                  return {
                        ...state,
                        [action.id]: {
                              ...state[action.id],
                              date: action.date
                        }
                  };
            case EDIT_TASK_TIME:
                  return {
                        ...state,
                        [action.id]: {
                              ...state[action.id],
                              time: action.time
                        }
                  };
            case EDIT_TASKS_POSITION:
                  return {
                        ...state,
                        [action.id]: {
                              ...state[action.id],
                              position: action.position
                        }
                  };
            default:
                  return state;
      }
}

export default tasks;
