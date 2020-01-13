import {
      RECEIVE_PROJECTS,
      RECEIVE_PROJECTS_CATEGORIES,
      RECEIVE_PROJECT_HEADLINES,
      ADD_PROJECT,
      DELETE_ITEMS_PROJECT,
      EDIT_NAME_PROJECT,
      SYNC_NAME_PROJECT,
      EDIT_POSITION_PROJECTS,
      EDIT_TASKSCATEGORY_POSITION
} from '../actions/projectAction';

function projects(state = {}, action) {
      let items = {};
      switch (action.type) {
            case RECEIVE_PROJECTS:
                  items = { ...state };
                  for (let item in items) {
                        if (items[item]['uid'] === action.uid && items[item]['type'] === 'project') delete items[item];
                  }
                  items = { ...items, ...action.projects };
                  return {
                        ...items
                  };
            case RECEIVE_PROJECTS_CATEGORIES:
                  items = { ...state };
                  for (let item in items) {
                        if (items[item]['uid'] === action.uid && items[item]['type'] === 'projectsCategory')
                              delete items[item];
                  }
                  items = { ...items, ...action.projects };
                  return {
                        ...items
                  };
            case RECEIVE_PROJECT_HEADLINES:
                  items = { ...state };
                  for (let item in items) {
                        if (items[item]['uid'] === action.uid && items[item]['type'] === 'tasksCategory')
                              delete items[item];
                  }
                  items = { ...items, ...action.projects };
                  return {
                        ...state,
                        ...action.projectHeadlines
                  };
            case ADD_PROJECT:
                  return {
                        ...state,
                        [action.payload.id]: {
                              ...action.payload.project,
                              id: action.payload.id,
                              uid: action.payload.uid
                        }
                  };
            case EDIT_NAME_PROJECT:
                  return {
                        ...state,
                        [action.payload.id]: {
                              ...state[action.payload.id],
                              name: action.payload.name
                        }
                  };
            case SYNC_NAME_PROJECT:
                  return {
                        ...state,
                        [action.id]: {
                              ...state[action.id],
                              name: action.name
                        }
                  };
            case DELETE_ITEMS_PROJECT:
                  let newState = Object.assign({}, state);
                  newState[action.payload.id] = Object.assign({}, state[action.payload.id]);
                  delete newState[action.payload.id];
                  return {
                        ...newState
                  };
            case EDIT_POSITION_PROJECTS:
                  return {
                        ...state,
                        [action.payload.id]: {
                              ...state[action.payload.id],
                              position: action.payload.position
                        }
                  };
            case EDIT_TASKSCATEGORY_POSITION:
                  return {
                        ...state,
                        [action.payload.id]: {
                              ...state[action.payload.id],
                              project: action.payload.project
                        }
                  };
            default:
                  return state;
      }
}

export default projects;
