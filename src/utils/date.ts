import {ChartDataPoint, Target} from '@/api/types';

export const getPreviousDay = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return {today, yesterday};
};

export const findDailyUsage = (data: ChartDataPoint[], todayStr: string, yesterdayStr: string) => {
  let todayUsage = 0;
  let yesterdayUsage = 0;

  if (data && data.length > 0) {
    const todayData = data.find(item => item.date.startsWith(todayStr));
    const yesterdayData = data.find(item => item.date.startsWith(yesterdayStr));

    if (todayData) {
      todayUsage = todayData.value;
    }
    if (yesterdayData) {
      yesterdayUsage = yesterdayData.value;
    }
  }

  return {todayUsage, yesterdayUsage};
};

export const calculateAverageAndMaxPower = (data: ChartDataPoint[], todayStr: string) => {
  let averagePower = 0;
  let maxPower = 0;

  if (data && data.length > 0) {
    const todayHourlyData = data.filter(item => item.date.startsWith(todayStr));

    if (todayHourlyData.length > 0) {
      const todayValues = todayHourlyData.map(item => item.value);
      averagePower = todayValues.reduce((sum, value) => sum + value, 0) / todayValues.length;
      maxPower = Math.max(...todayValues);
    }
  }

  return {averagePower, maxPower};
};

export const getPreviousMonth = (month: number, year: number) => {
  const lastMonth = month === 0 ? 11 : month - 1;
  const lastMonthYear = month === 0 ? year - 1 : year;
  return {month: lastMonth, year: lastMonthYear};
};

export const findDataByMonthAndYear = (data: ChartDataPoint[], month: number, year: number) => {
  return data.find(item => {
    const date = new Date(item.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
};

export const extractCurrentAndPreviousMonthValues = (data: ChartDataPoint[], thisMonth: number, thisYear: number) => {
  let thisMonthValue = 0;
  let lastMonthValue = 0;

  if (data && data.length > 0) {
    const thisMonthData = findDataByMonthAndYear(data, thisMonth, thisYear);
    if (thisMonthData) {
      thisMonthValue = thisMonthData.value;
    }

    const {month: lastMonth, year: lastMonthYear} = getPreviousMonth(thisMonth, thisYear);
    const lastMonthData = findDataByMonthAndYear(data, lastMonth, lastMonthYear);
    if (lastMonthData) {
      lastMonthValue = lastMonthData.value;
    }
  }

  return {thisMonthValue, lastMonthValue};
};

export const formatDateLabel = (dateString: string, type: Target) => {
  const date = new Date(dateString);
  switch (type) {
    case 'hour':
      return date.getHours().toString().padStart(2, '0') + ':00';
    case 'day':
      return `${date.getMonth() + 1}/${date.getDate()}`;
    case 'month':
      return `${date.getMonth() + 1}월`;
    default:
      return '';
  }
};
