import { FormControl, MenuItem, Select } from "@material-ui/core";
import React from "react";

interface IProps {
  period: any;
  handleChange: any;
}

function SelectPeriod({ period, handleChange }: IProps) {
  return (
    <FormControl size="small" style={{ marginBottom: 20 }}>
      <Select
        labelId="demo-select-small-label"
        id="demo-select-small"
        value={period}
        variant="outlined"
        onChange={handleChange}
      >
        <MenuItem value={1}>Today</MenuItem>
        <MenuItem value={30}>Month</MenuItem>
      </Select>
    </FormControl>
  );
}

export default SelectPeriod;
