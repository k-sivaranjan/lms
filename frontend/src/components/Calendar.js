import { useState, useEffect } from 'react';
import { useUser } from '../utils/userContext';
import { Toast } from "./Toast";
import api from "../utils/api";
import '../styles/calendar.css';
import '../styles/loader.css';

function Calendar() {
  const { user } = useUser();
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [teamLeaveData, setTeamLeaveData] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [leaveDataLoading, setLeaveDataLoading] = useState(true);

  const leaveTypeColors = {
    'Casual Leave': '#4CAF50',
    'Sick Leave': '#060270',
    'Paid Leave': '#2196F3',
    'Emergency Leave': '#F44336',
    'Loss of Pay': '#FF9800',
    'Weekend': '#E8E8E8',
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const parseLocalDate = (dateStr) => {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const fetchAllUsersinTeam = async () => {
    try {
      const res = await api.get('/auth/users');
      const currentManagerId = user.id;
      let members = user.role.name !== 'admin'
        ? res.data.data.users.filter(u => u.managerId === currentManagerId)
        : res.data.data.users;

      setTeamMembers(members);
    } catch (error) {
      Toast.error("Error fetching users");
      setTeamMembers([]);
    } finally {
      setTeamLoading(false);
    }
  };

  const fetchTeamLeaveData = async (teamMemberIds, month, year) => {
    try {
      const response = await api.get('/leave/team-leaves', {
        params: {
          teamMembers: teamMemberIds.join(','),
          month,
          year,
          role: user.role.name
        }
      });
      return response.data.leaveRequests;
    } catch (error) {
      Toast.error("Error fetching team leave data");
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setTeamLoading(true);
      await fetchAllUsersinTeam();
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadTeamLeaveData = async () => {
      if (teamMembers.length === 0) {
        setLeaveDataLoading(false);
        return;
      }
      setLeaveDataLoading(true);
      try {
        const data = await fetchTeamLeaveData(
          teamMembers.map(member => member.id),
          selectedMonth + 1,
          selectedYear
        );
        setTeamLeaveData(data || []);
      } finally {
        setLeaveDataLoading(false);
      }
    };

    loadTeamLeaveData();
  }, [selectedMonth, selectedYear, teamMembers]);

  const renderCalendarHeader = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayOfWeek = new Date(selectedYear, selectedMonth, day).getDay();
      const isWeekend = [0, 6].includes(dayOfWeek);
      return (
        <th key={day} className={`date-header ${isWeekend ? 'weekend' : ''}`}>
          <div>{day}</div>
          <div className="day-name">{dayNames[dayOfWeek]}</div>
        </th>
      );
    });
  };

  const renderCalendarBody = () => {
    return teamMembers.map(member => {
      const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
      const memberLeaves = teamLeaveData.filter(leave => leave.lr_user_id === member.id);

      const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const currentDate = new Date(selectedYear, selectedMonth, day);
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        const leaveOnThisDay = memberLeaves.find(leave => {
          const startDate = parseLocalDate(leave.lr_start_date);
          const endDate = parseLocalDate(leave.lr_end_date);
          return currentDate >= startDate && currentDate <= endDate && !isWeekend;
        });

        return (
          <td key={`${member.id}-${day}`} className={`calendar-cell ${isWeekend ? 'weekend' : ''}`}>
            {leaveOnThisDay ? (
              <div
                className="leave-indicator"
                style={{ backgroundColor: leaveTypeColors[leaveOnThisDay.leaveTypeName] || '#999' }}
                title={leaveOnThisDay.leaveTypeName}
              />
            ) : null}
          </td>
        );
      });

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

  const renderLegend = () => (
    <div className="calendar-legend">
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

      {(teamLoading || leaveDataLoading) ? (
        <div className="spinner-container">
          <div className="dot-spinner">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
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
              <tbody className="t-body">
                {renderCalendarBody()}
              </tbody>
            </table>
          </div>
          {renderLegend()}
        </>
      )}
    </div>
  );
}

export default Calendar;