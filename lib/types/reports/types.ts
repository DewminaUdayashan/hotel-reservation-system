export type OccupancyData = {
  reportDate: string;
  reservations: number;
  occupiedRooms: number;
  totalRooms: number;
  occupancyRate: number;
};

export type FinancialDailyData = {
  reportDate: string;
  totalRevenue: number;
  roomRevenue: number;
  serviceRevenue: number;
  avgRoomRate: number;
};

type FinancialSummaryData = {
  totalRevenue: number;
  totalRoomRevenue: number;
  totalServiceRevenue: number;
  averageRevenue: number;
};

export type FinancialReport = {
  dailyData: FinancialDailyData[];
  summary: FinancialSummaryData;
};

export type NoShowDailyData = {
  reportDate: string;
  totalReservations: number;
  noShows: number;
  noShowRate: number;
  date: Date;
};

export type NoShowSummaryData = {
  totalReservations: number;
  totalNoShows: number;
  averageNoShowRate: number;
};

export type NoShowReport = {
  dailyData: NoShowDailyData[];
  summary: NoShowSummaryData;
};

export type RevenueByRoomTypeReport = {
  roomTypeId: number;
  roomTypeName: string;
  revenue: number;
  occupancyRate: number;
  reservations: number;
  averageRatePerNight: number;
};

export type ForecastOccupancy = {
  forecastDate: string;
  forecastOccupancy: number;
  confirmedReservations: number;
  availableRooms: number;
  projectedRevenue: number;
};

export type ForecastResponse = {
  success: boolean;
  data: ForecastOccupancy[];
  notEnoughData: boolean;
};
