import moment from 'moment';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////// ITEMMENU ACTION  ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const OPEN_ITEM_MENU = 'OPEN_ITEM_MENU';
export const CLOSE_ITEM_MENU = 'CLOSE_ITEM_MENU';
export const SET_SELECTED_ITEM = 'SET_SELECTED_ITEM';

export function openItemMenuAction() {
      return dispatch => {
            dispatch({
                  type: OPEN_ITEM_MENU
            });
      };
}

export function closeItemMenuAction() {
      return dispatch => {
            dispatch({
                  type: CLOSE_ITEM_MENU
            });
      };
}

export function setSelectedItemAction(item) {
      return dispatch => {
            dispatch({
                  type: SET_SELECTED_ITEM,
                  item: item
            });
      };
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////// TASKADDER ACTION  ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const OPEN_TASK_ADDER = 'OPEN_TASK_ADDER';
export const CLOSE_TASK_ADDER = 'CLOSE_TASK_ADDER';

export function openTaskAdderAction() {
      return dispatch => {
            dispatch({
                  type: OPEN_TASK_ADDER
            });
      };
}

export function closeTaskAdderAction() {
      return dispatch => {
            dispatch({
                  type: CLOSE_TASK_ADDER
            });
      };
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////// DATEMOVER ACTION  ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const OPEN_DATE_MOVER = 'OPEN_DATE_MOVER';
export const CLOSE_DATE_MOVER = 'CLOSE_DATE_MOVER';
export const DATE_SELECTED_DATE_MOVER = 'DATE_SELECTED_DATE_MOVER';
export const VISIBLE_MONTH_DATE_MOVER = 'VISIBLE_MONTH_DATE_MOVER';

export function openDateMoverAction() {
      return dispatch => {
            dispatch({
                  type: OPEN_DATE_MOVER
            });
      };
}

export function closeDateMoverAction() {
      return dispatch => {
            dispatch({
                  type: CLOSE_DATE_MOVER
            });
      };
}

export function setDateSelectedDateMoverAction(day, month) {
      let dateSelectedDateMover;

      let selectedMonth = moment()
            .add(month - 12, 'month')
            .format('L');
      let momentDate = moment().set({
            date: day,
            month: parseInt(selectedMonth.substring(0, 2)) - 1,
            year: selectedMonth.substring(6)
      });

      dateSelectedDateMover = momentDate.format('L');

      return dispatch => {
            dispatch({
                  type: DATE_SELECTED_DATE_MOVER,
                  dateSelectedDateMover: dateSelectedDateMover
            });
      };
}

export function setVisibleMonthDateMoverAction(visibleMonth) {
      return dispatch => {
            dispatch({
                  type: VISIBLE_MONTH_DATE_MOVER,
                  visibleMonth: visibleMonth
            });
      };
}
