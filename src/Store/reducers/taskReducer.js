// TODO: Find the most performant between all tasks in store state and after sort on the component what tasks you need
// Or everytime a component mount, create a state in the store that represent the day (and if we change the date of the item, we should move from the day and after rewrite it in an other day)

import {
      RECEIVE_TASKS,
      ADD_TASK,
      DELETE_TASK,
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
            case DELETE_TASK:
                  const { [action.id]: taskToDelete, ...tasksObjectWithoutTask } = state.tasks;
                  return {
                        ...state,
                        ...tasksObjectWithoutTask
                        // tasks: {
                        //       ...tasksObjectWithoutTask,
                        // }
                        // [action.id]:
                        // [action.date]: dateObjectWithoutTask
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
