'use client';
 
import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
 
const presetsList = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last7days' },
  { label: 'Last 30 days', value: 'last30days' },
  { label: 'Last 90 days', value: 'last90days' },
];
 
const DateRangePicker = ({ onDateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
 
  const selectPreset = (preset) => {
    const today = new Date();
    let start, end;
 
    switch (preset) {
      case 'today':
        start = end = format(today, 'yyyy-MM-dd');
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        start = end = format(yesterday, 'yyyy-MM-dd');
        break;
      case 'last7days':
        start = format(subDays(today, 6), 'yyyy-MM-dd');
        end = format(today, 'yyyy-MM-dd');
        break;
      case 'last30days':
        start = format(subDays(today, 29), 'yyyy-MM-dd');
        end = format(today, 'yyyy-MM-dd');
        break;
      case 'last90days':
        start = format(subDays(today, 89), 'yyyy-MM-dd');
        end = format(today, 'yyyy-MM-dd');
        break;
      default:
        return;
    }
 
    setStartDate(start);
    setEndDate(end);
    setIsOpen(false);
 
    if (onDateChange) {
      onDateChange({ startDate: start, endDate: end });
    }
  };
 
  useEffect(() => {
    if (!startDate && !endDate) {
      selectPreset('last90days');
    }
  }, []);
 
  return (
    <div className="relative w-full max-w-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border rounded-md text-sm bg-white shadow"
      >
        {startDate && endDate ? `${startDate} - ${endDate}` : 'Select date range'}
      </button>
 
      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white shadow-lg rounded-lg p-4 w-full">
          <div className="space-y-3">
            {presetsList.map((preset) => (
              <button
                key={preset.value}
                onClick={() => selectPreset(preset.value)}
                className="w-full text-left py-1 px-2 text-sm hover:bg-blue-600 hover:text-white rounded"
              >
                {preset.label}
              </button>
            ))}
 
            <div className="flex items-center space-x-2">
              <label className="text-sm w-24">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (onDateChange) onDateChange({ startDate: e.target.value, endDate });
                }}
                className="border px-2 py-1 rounded w-full text-sm"
              />
            </div>
 
            <div className="flex items-center space-x-2">
              <label className="text-sm w-24">End Date:</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (onDateChange) onDateChange({ startDate, endDate: e.target.value });
                }}
                className="border px-2 py-1 rounded w-full text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default DateRangePicker;