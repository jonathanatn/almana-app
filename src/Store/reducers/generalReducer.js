import {
      OPEN_ITEM_MENU,
      CLOSE_ITEM_MENU,
      SET_SELECTED_ITEM,
      OPEN_TASK_ADDER,
      CLOSE_TASK_ADDER,
      OPEN_DATE_MOVER,
      CLOSE_DATE_MOVER,
      DATE_SELECTED_DATE_MOVER,
      VISIBLE_MONTH_DATE_MOVER
} from '../actions/generalAction';

// import { getToday } from '../../Utils/helpers';

const generalState = {
      isItemMenuOpen: false,
      selectedItem: {},
      isTaskAdderOpen: false,
      isDateMoverOpen: false,
      dateSelectedDateMover: ''
};

function generalReducer(state = generalState, action) {
      switch (action.type) {
            //////////////////////////////////////////////////////////////////////////////////////////////////////
            /////////////////////////////////////// ITEMMENU  ////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////////////////////////
            case OPEN_ITEM_MENU:
                  return {
                        ...state,
                        isItemMenuOpen: true
                  };
            case CLOSE_ITEM_MENU:
                  return {
                        ...state,
                        isItemMenuOpen: false
                  };
            case SET_SELECTED_ITEM:
                  return {
                        ...state,
                        selectedItem: action.item
                  };
            //////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////// TASKADDER  ///////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////////////////////////
            case OPEN_TASK_ADDER:
                  return {
                        ...state,
                        isTaskAdderOpen: true
                  };
            case CLOSE_TASK_ADDER:
                  return {
                        ...state,
                        isTaskAdderOpen: false
                  };
            //////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////// DATEMOVER  //////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////////////////////////
            case OPEN_DATE_MOVER:
                  return {
                        ...state,
                        isDateMoverOpen: true
                  };
            case CLOSE_DATE_MOVER:
                  return {
                        ...state,
                        isDateMoverOpen: false
                  };
            case DATE_SELECTED_DATE_MOVER:
                  return {
                        ...state,
                        dateSelectedDateMover: action.dateSelectedDateMover
                  };
            case VISIBLE_MONTH_DATE_MOVER:
                  return {
                        ...state,
                        visibleMonth: action.visibleMonth
                  };
            default:
                  return state;
      }
}

export default generalReducer;
