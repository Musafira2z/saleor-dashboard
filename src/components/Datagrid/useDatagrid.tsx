import { useCallback, useEffect, useRef, useState } from "react";
import { Matrix } from "react-spreadsheet";

import { MoneyCellEdit, MoneyCellView } from "./MoneyCell";
import { MoneyToggleCellView } from "./MoneyToggleCell";
import { NumberCellEdit, NumberCellView } from "./NumberCell";
import { AvailableColumn, ColumnState, DatagridCell } from "./types";

function getId(row: DatagridCell[]): string {
  return row[0].id;
}

export interface UseDatagridOpts<T> {
  availableColumns: AvailableColumn[];
  data: T[];
  getData: (row: T, column: string) => DatagridCell;
  onChange: (data: Matrix<DatagridCell>) => void;
}

function getViewer(type: DatagridCell["type"]) {
  switch (type) {
    case "money":
      return MoneyCellView;
    case "moneyToggle":
      return MoneyToggleCellView;
    case "number":
      return NumberCellView;
    default:
      return undefined;
  }
}

function getEditor(type: DatagridCell["type"]) {
  switch (type) {
    case "money":
    case "moneyToggle":
      return MoneyCellEdit;
    case "number":
      return NumberCellEdit;
    default:
      return undefined;
  }
}

function useDatagrid<T extends { id: string }>({
  availableColumns,
  data: initial,
  getData,
  onChange: onChangeBase
}: UseDatagridOpts<T>) {
  const [columns, setColumns] = useState<ColumnState[]>(
    availableColumns.map(c => ({
      ...c,
      width: 200
    }))
  );
  const [rows, setRows] = useState<string[]>(initial.map(d => d.id));

  // May contain formulas
  const [data, setData] = useState<Matrix<DatagridCell>>([]);
  const dataRef = useRef<Matrix<DatagridCell>>(data);
  const updateRef = (d: Matrix<DatagridCell>) => {
    dataRef.current = d;
  };

  // Reload data after initial changes
  useEffect(() => {
    const newData = initial.map(v =>
      columns.map<DatagridCell>(c => ({
        ...getData(v, c.value),
        DataViewer: getViewer(c.type),
        DataEditor: getEditor(c.type)
      }))
    );
    setRows(initial.map(d => d.id));
    setData(newData);
    updateRef(newData);
  }, [initial]);

  // Move data after column/row changing (add new, reorder, etc.)
  useEffect(() => {
    if (rows.length && columns.length) {
      const newData = dataRef.current
        .map((_, index) =>
          dataRef.current.find(row => getId(row) === rows[index])
        )
        .map(row =>
          columns.map(
            c =>
              // Either move existing data or get initial
              // Example: select SKU column, deselect it and select it again.
              // The SKU column will now be filled with initial data regardless
              // of what had been typed into cells before it was unselected.
              row.find(f => f.column === c.value) ??
              getData(
                initial.find(d => d.id === getId(row)),
                c.value
              )
          )
        );
      setData(newData);
      updateRef(newData);
    }
  }, [columns, rows]);

  const onChange = useCallback(
    (data: Matrix<DatagridCell>) => {
      const fixedData = data.map((row, rowIndex) =>
        row.map((cell, cellIndex) =>
          cell === undefined
            ? // Happens after clearing with delete or backspace
              {
                ...getData(initial[rowIndex], columns[cellIndex].value),
                ...(cell.type === "moneyToggle" ? { toggled: false } : {}),
                value: ""
              }
            : cell
        )
      );
      updateRef(fixedData);
      onChangeBase(fixedData);
    },
    [getData, initial, columns]
  );

  const onColumnChange = useCallback(
    (columnNames: string[]) =>
      setColumns(prevColumns =>
        columnNames.map(column => ({
          ...availableColumns.find(c => c.value === column),
          width: prevColumns.find(pc => pc.value === column)?.width ?? 200
        }))
      ),
    [setColumns]
  );

  const onColumnMove = useCallback(
    (columnIndex, targetIndex) =>
      setColumns(columns => {
        const c = [...columns];
        const r = c.splice(targetIndex, 1)[0];
        c.splice(columnIndex, 0, r);

        return c;
      }),
    [setColumns]
  );

  const onColumnResize = useCallback(
    (column: ColumnState, move: number) =>
      setColumns(prevColumns =>
        prevColumns.map(pc =>
          pc.value === column.value ? { ...pc, width: pc.width + move } : pc
        )
      ),
    [setColumns]
  );

  return {
    columns,
    data,
    rows,
    setRows,
    onChange,
    onColumnChange,
    onColumnMove,
    onColumnResize
  };
}

export default useDatagrid;
