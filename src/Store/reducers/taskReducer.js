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
                        [action.date]: {
                              ...state[action.date],
                              ...action.tasks
                        }
                  };
            case ADD_TASK:
                  // TODO: Something seems wrong here
                  console.log(action.task);
                  // console.log(action.taskId);
                  return {
                        ...state,
                        [action.taskId]: action.task
                  };
            case DELETE_TASK:
                  const { [action.id]: taskToDelete, ...dateObjectWithoutTask } = state[action.date];
                  return {
                        ...state,
                        [action.date]: dateObjectWithoutTask
                  };
            case EDIT_TASK_DATE:
                  const taskId = action.id;
                  const date = action.date;
                  const previousDate = action.previousDate;
                  // The object at the previous that without the current item
                  //https://stackoverflow.com/questions/34401098/remove-a-property-in-an-object-immutably
                  const { [taskId]: taskToDeleteFromPreviousDate, ...previousDateWithoutTask } = state[previousDate];
                  //Copy the object and edit it
                  const item = state[previousDate][taskId];
                  item.date = date;
                  return {
                        ...state,
                        //Removing the item in the previousDate in the store
                        [previousDate]: previousDateWithoutTask,
                        //Adding the item in the new date in the store
                        [date]: {
                              ...state[date],
                              [taskId]: item
                        }
                  };
            case EDIT_TASK_TIME:
                  // console.log('REDUCER', 'ID: ', action.id, 'DATE: ', action.date);
                  return {
                        ...state,
                        [action.date]: {
                              ...state[action.date],
                              [action.id]: {
                                    ...state[action.date][action.id],
                                    time: action.time
                              }
                        }
                  };
            case EDIT_TASKS_POSITION:
                  return {
                        ...state,
                        [action.date]: {
                              ...state[action.date]
                              // action.tasks
                        }
                  };
            default:
                  return state;
      }
}

export default tasks;
