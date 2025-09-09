import { useCallback } from 'react';

import { useDispatch } from 'react-redux';

export const useTableActions = (setPageAction, setSortAction, sort) => {
  const dispatch = useDispatch();

  const goToPage = useCallback(
    (pageIndex) => {
      dispatch(setPageAction(pageIndex + 1));
    },
    [dispatch, setPageAction]
  );

  const sortBy = useCallback(
    (column) => {
      if (sort.type === column.id) {
        dispatch(
          setSortAction({
            type: column.id,
            value: sort.value === 'asc' ? 'desc' : 'asc',
          })
        );
      } else {
        dispatch(setSortAction({ type: column.id, value: 'desc' }));
      }
    },
    [dispatch, setSortAction, sort]
  );

  return {
    goToPage,
    sortBy,
  };
};
