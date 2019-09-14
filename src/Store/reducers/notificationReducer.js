function notificationReducer(state = {}, action) {
      switch (action.type) {
            case 'SET_LOCAL_NOTIFICATION':
                  console.log('local notif reducer');
                  return {
                        ...state
                  };
            default:
                  return state;
      }
}

export default notificationReducer;
