import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Box, TextFieldProps } from "@mui/material";
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
// استيراد i18n للغة الحالية

type DateFieldProps = {
  label?: string;
  mode?: "create" | "view" | "edit";
  value?: string;
  onChange?: (date: Dayjs | null) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  minDate?: Dayjs;
  isRTL?: boolean;
};

export default function DateField({
  label,
  mode = "edit",
  value,
  onChange,
  disabled,
  error,
  helperText,
  minDate,
  isRTL,
}: DateFieldProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(
    value ? dayjs(value) : null
  );

  useEffect(() => {
    setSelectedDate(value ? dayjs(value) : null);
  }, [value]);

  const handleChange = (newValue: Dayjs | null) => {
    if (mode !== "view") {
      setSelectedDate(newValue);
      onChange?.(newValue);
    }
  };

  // Set minimum date to today if no minDate is provided
  const effectiveMinDate = minDate || dayjs().startOf('day');

  return (
    <LocalizationProvider 
      dateAdapter={AdapterDayjs} 
      adapterLocale={isRTL ? 'ar' : 'en'}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        direction: isRTL ? 'rtl' : 'ltr'
      }}>
        {label && (
          <label className={` block text-sm font-semibold text-wh_bl_text ${isRTL ? 'text-right' : 'text-left'}`}>
            {label}
          </label>
        )}
        <DatePicker
          value={selectedDate}
          onChange={handleChange}
          disabled={disabled || mode === "view"}
          views={["year", "month", "day"]}
          minDate={effectiveMinDate}
          slotProps={{
            textField: {
              fullWidth: true,
              error,
              helperText,
              dir: isRTL ? 'rtl' : 'ltr',
              sx: {
                "& .MuiInputBase-root": {
                  padding: '0 0.75rem',
                  paddingRight: isRTL ? "10px" : "40px",  
                  paddingLeft: isRTL ? "40px" : "10px", 
                  marginBottom: '0.5rem',
                  borderRadius: "12px",
                  backgroundColor: "var(--input-feilds)",
                  color: "var(--text-body)",
                  textAlign: isRTL ? 'right' : 'left',
                  "&.Mui-disabled": {
                    backgroundColor: "var(--disable-input-feilds)",
                    cursor: "not-allowed",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--border-color)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--border-color)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    border: "2px solid #3b82f6",
                  },
                },
                "& .MuiOutlinedInput-input": {
                  flex: "1 1 auto",
                  p: "0.75rem 0",
                  lineHeight: 1.6,
                  height: "unset",
                  opacity: 1,
                  direction: isRTL ? 'rtl' : 'ltr',
                  textAlign: isRTL ? 'right' : 'left',
                  "&.Mui-disabled": {
                    opacity: 1,
                    WebkitTextFillColor: "var(--text-body)",
                  },
                },
                // تعديل الأيقونة لمراعاة الاتجاه
                "& .MuiInputAdornment-root": {
                  margin: 0,
                  position: 'absolute',
                  [isRTL ? 'left' : 'right']: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  "& .MuiButtonBase-root": {
                    margin: 0,
                    padding: 0,
                    "& .MuiSvgIcon-root": {
                      fill: 'var(--text-body)'
                    }
                  }
                },
                // RTL support for the date picker popup
                "& .MuiPickersPopper-paper": {
                  direction: isRTL ? 'rtl' : 'ltr',
                },
              },
            } satisfies TextFieldProps,
          }}
        />
      </Box>
    </LocalizationProvider>
  );
}
