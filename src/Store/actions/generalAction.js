import moment from 'moment';
import { receiveTasksAction } from './taskAction';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////// ITEMMENU ACTION  ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const OPEN_TASK_MENU = 'OPEN_TASK_MENU';
export const CLOSE_TASK_MENU = 'CLOSE_TASK_MENU';
export const OPEN_EVENT_MENU = 'OPEN_EVENT_MENU';
export const CLOSE_EVENT_MENU = 'CLOSE_EVENT_MENU';
export const SET_SELECTED_ITEM = 'SET_SELECTED_ITEM';

export function openTaskMenuAction() {
      return dispatch => {
            dispatch({
                  type: OPEN_TASK_MENU
            });
      };
}

export function closeTaskMenuAction() {
      return dispatch => {
            dispatch({
                  type: CLOSE_TASK_MENU
            });
      };
}

export function openEventMenuAction() {
      return dispatch => {
            dispatch({
                  type: OPEN_EVENT_MENU
            });
      };
}

export function closeEventMenuAction() {
      return dispatch => {
            dispatch({
                  type: CLOSE_EVENT_MENU
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
///////////////////////////////////// ITEMS ADDER ACTION  //////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const OPEN_TASK_ADDER = 'OPEN_TASK_ADDER';
export const CLOSE_TASK_ADDER = 'CLOSE_TASK_ADDER';

export const OPEN_EVENT_ADDER = 'OPEN_EVENT_ADDER';
export const CLOSE_EVENT_ADDER = 'CLOSE_EVENT_ADDER';

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

export function openEventAdderAction() {
      return dispatch => {
            dispatch({
                  type: OPEN_EVENT_ADDER
            });
      };
}

export function closeEventAdderAction() {
      return dispatch => {
            dispatch({
                  type: CLOSE_EVENT_ADDER
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
            // FIXME: get firestore as a source of truth
            // dispatch(receiveTasksAction(dateSelectedDateMover));
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
