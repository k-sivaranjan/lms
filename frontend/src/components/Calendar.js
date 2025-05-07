import React, { useState, useEffect } from 'react';
import '../styles/calendar.css';

const Calendar = ({ teamMembers, fetchTeamLeaveData }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [teamLeaveData, setTeamLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);

  const leaveTypeColors = {
    'Casual Leave': '#4CAF50',     // Green
    'Sick Leave': '#060270',       // Purple
    'Paid Leave': '#2196F3',       // Blue
    'Maternity Leave': '#9C27B0',  // Purple
    'Paternity Leave': '#00BCD4',  // Cyan
    'Emergency Leave': '#F44336',  // Deep Orange
    'Loss of Pay': '#FF9800',      // Orange
  };  

  // Month names array
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const loadTeamLeaveData = async () => {
      if (!teamMembers || teamMembers.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchTeamLeaveData(
          teamMembers.map(member => member.id),
          selectedMonth + 1,
          selectedYear
        );
        setTeamLeaveData(data || []);
      } catch (error) {
        console.error("Error fetching team leave data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamLeaveData();
  }, [selectedMonth, selectedYear, teamMembers, fetchTeamLeaveData]);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const renderCalendarHeader = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const dateHeaders = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const dayOfWeek = new Date(selectedYear, selectedMonth, i).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      dateHeaders.push(
        <th
          key={i}
          className={`date-header ${isWeekend ? 'weekend' : ''}`}
        >
          {i}
        </th>
      );
    }

    return dateHeaders;
  };

  const renderCalendarBody = () => {
    if (!teamMembers || teamMembers.length === 0) return null;
  
    return teamMembers.map(member => {
      const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
      // Filter the team leave data for the current member
      const memberLeaves = teamLeaveData.filter(leave => leave.lr_user_id === member.id);
  
      const dayCells = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(selectedYear, selectedMonth, day);
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
        // Find any leave request that matches the current date
        const leaveOnThisDay = memberLeaves.find(leave => {
          const startDate = new Date(leave.lr_start_date);
          const endDate = new Date(leave.lr_end_date);
          
          // Check if the current day is within the leave date range
          return currentDate >= startDate && currentDate <= endDate;
        });
  
        dayCells.push(
          <td
            key={`${member.id}-${day}`}
            className={`calendar-cell ${isWeekend ? 'weekend' : ''}`}
          >
            {leaveOnThisDay && (
              <div
                className="leave-indicator"
                style={{
                  backgroundColor: leaveTypeColors[leaveOnThisDay.leaveTypeName] || '#999'
                }}
                title={`${leaveOnThisDay.leaveTypeName}`}
              />
            )}
          </td>
        );
      }
  
      return (
        <tr key={member.id}>
          <td className="member-name" title={member.name}>{member.name}</td>
          {dayCells}
        </tr>
      );
    });
  };
  

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const renderLegend = () => {
    return (
      <div className="calendar-legend">
        <h4>Leave Types</h4>
        <div className="legend-items">
          {Object.entries(leaveTypeColors).map(([type, color]) => (
            <div key={type} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: color }}></div>
              <div className="legend-label">{type}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="team-calendar-container">
      <div className="calendar-header">
        <h3>Team Calendar</h3>
        <div className="month-selector">
          <button onClick={handlePrevMonth}>❮</button>
          <span>{monthNames[selectedMonth]} {selectedYear}</span>
          <button onClick={handleNextMonth}>❯</button>
        </div>
      </div>

      {loading ? (
        <p className="loading-message">Loading calendar data...</p>
      ) : (
        <>
          <div className="calendar-table-container">
            <table className="calendar-table">
              <thead>
                <tr>
                  <th className="member-header">Team Members</th>
                  {renderCalendarHeader()}
                </tr>
              </thead>
              <tbody>
                {renderCalendarBody()}
              </tbody>
            </table>
          </div>
          {renderLegend()}
        </>
      )}
    </div>
  );
};

export default Calendar;