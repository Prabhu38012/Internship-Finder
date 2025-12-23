import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Grid,
  Autocomplete,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";

const WishlistDialog = ({
  open,
  onClose,
  onSave,
  item = null,
  internship = null,
}) => {
  const [formData, setFormData] = useState({
    notes: "",
    priority: "medium",
    category: "interested",
    applicationStatus: "not_applied",
    tags: [],
    reminderDate: null,
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (item) {
      setFormData({
        notes: item.notes || "",
        priority: item.priority || "medium",
        category: item.category || "interested",
        applicationStatus: item.applicationStatus || "not_applied",
        tags: item.tags || [],
        reminderDate: item.reminderDate ? dayjs(item.reminderDate) : null,
      });
    } else {
      setFormData({
        notes: "",
        priority: "medium",
        category: "interested",
        applicationStatus: "not_applied",
        tags: [],
        reminderDate: null,
      });
    }
  }, [item, open]);

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleTagsChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      tags: newValue,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      reminderDate: date,
    }));
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      internshipId: internship?._id || item?.internship?._id,
    };

    if (item) {
      onSave(item._id, submitData);
    } else {
      onSave(null, submitData);
    }
    onClose();
  };

  const predefinedTags = [
    "High Priority",
    "Dream Job",
    "Good Fit",
    "Remote",
    "Good Stipend",
    "Learning Opportunity",
    "Career Growth",
    "Flexible Hours",
    "Startup",
    "Big Company",
    "Technical",
    "Creative",
    "Leadership",
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {item ? "Edit Wishlist Item" : "Add to Wishlist"}
      </DialogTitle>

      <DialogContent>
        {(internship || item?.internship) && (
          <Box mb={3} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="h6">
              {internship?.title || item?.internship?.title}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {internship?.companyName || item?.internship?.companyName}
            </Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={handleInputChange("notes")}
              placeholder="Add your thoughts about this internship..."
              helperText="Personal notes about why you're interested in this position"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={handleInputChange("priority")}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={handleInputChange("category")}
                label="Category"
              >
                <MenuItem value="interested">Interested</MenuItem>
                <MenuItem value="backup">Backup Option</MenuItem>
                <MenuItem value="dream_job">Dream Job</MenuItem>
                <MenuItem value="applied">Applied</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Application Status</InputLabel>
              <Select
                value={formData.applicationStatus}
                onChange={handleInputChange("applicationStatus")}
                label="Application Status"
              >
                <MenuItem value="not_applied">Not Applied</MenuItem>
                <MenuItem value="planning_to_apply">Planning to Apply</MenuItem>
                <MenuItem value="applied">Applied</MenuItem>
                <MenuItem value="no_longer_interested">
                  No Longer Interested
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Reminder Date"
                value={formData.reminderDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: "Set a reminder for this internship",
                  },
                }}
                minDateTime={dayjs()}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              multiple
              freeSolo
              options={predefinedTags}
              value={formData.tags}
              onChange={handleTagsChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    key={index}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Add tags to organize your wishlist"
                  helperText="Press Enter to add custom tags or select from suggestions"
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.notes?.trim() && formData.tags.length === 0}
        >
          {item ? "Update" : "Add to Wishlist"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WishlistDialog;
