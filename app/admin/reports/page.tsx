"use client";

import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  format,
  subDays,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  toDate,
} from "date-fns";
import {
  Download,
  FileText,
  Printer,
  RefreshCw,
  BarChart3,
  DollarSign,
  Hotel,
  Bed,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useOccupancyReport } from "@/hooks/reports/useOccupancyReport";
import { today } from "@/lib/utils/moment";
import { useFinancialReport } from "@/hooks/reports/useFinancialReport";
import { useNoShowReport } from "@/hooks/reports/useNoShowReport";
import { useRevenueByRoomTypeReport } from "@/hooks/reports/useRevenueByRoomTypeReport";
import { useForecastReport } from "@/hooks/reports/useForecasetReport";

// Define report types
type ReportType = "occupancy" | "financial" | "noShow" | "revenue" | "forecast";

// Mock data fetching functions

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY?: number;
    };
  }
}

// Add proper typing for autoTable
declare module "jspdf-autotable" {
  interface UserOptions {
    startY?: number | false;
    head?: RowInput[] | undefined;
    body?: RowInput[] | undefined;
    headStyles?: Partial<Styles> | undefined;
    alternateRowStyles?: Partial<Styles> | undefined;
    columnStyles?: { [key: string]: Partial<Styles> } | undefined;
  }
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("occupancy");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date()),
  });
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Fetch report data based on active report type
  const {
    data: occupancyData,
    isLoading: isLoadingOccupancy,
    refetch: refetchOccupancy,
  } = useOccupancyReport({
    dateRange,
  });

  const {
    data: financialData,
    isLoading: isLoadingFinancial,
    refetch: refetchFinancial,
  } = useFinancialReport({
    dateRange,
  });

  const {
    data: noShowData,
    isLoading: isLoadingNoShow,
    refetch: refetchNoShow,
  } = useNoShowReport({
    dateRange,
  });

  const {
    data: revenueByRoomTypeData,
    isLoading: isLoadingRevenueByRoomType,
    refetch: refetchRevenueByRoomType,
  } = useRevenueByRoomTypeReport({ dateRange });

  const {
    data: forecastData,
    isLoading: isLoadingForecast,
    refetch: refetchForecast,
  } = useForecastReport({
    dateRange,
  });

  console.log("Forecast Data:", forecastData);

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  // Handle quick date range selections
  const handleQuickDateRange = (range: string) => {
    const today = new Date();

    switch (range) {
      case "today":
        setDateRange({ from: today, to: today });
        break;
      case "yesterday":
        const yesterday = subDays(today, 1);
        setDateRange({ from: yesterday, to: yesterday });
        break;
      case "thisWeek":
        setDateRange({ from: startOfWeek(today), to: endOfWeek(today) });
        break;
      case "lastWeek":
        const lastWeekStart = startOfWeek(subDays(today, 7));
        const lastWeekEnd = endOfWeek(subDays(today, 7));
        setDateRange({ from: lastWeekStart, to: lastWeekEnd });
        break;
      case "thisMonth":
        setDateRange({ from: startOfMonth(today), to: endOfMonth(today) });
        break;
      case "lastMonth":
        const lastMonthStart = startOfMonth(subDays(startOfMonth(today), 1));
        const lastMonthEnd = endOfMonth(subDays(startOfMonth(today), 1));
        setDateRange({ from: lastMonthStart, to: lastMonthEnd });
        break;
      case "next7Days":
        setDateRange({ from: today, to: addDays(today, 7) });
        break;
      case "next30Days":
        setDateRange({ from: today, to: addDays(today, 30) });
        break;
      default:
        break;
    }
  };

  // Generate PDF for the active report
  const generatePdf = () => {
    setIsGenerating(true);

    try {
      // Create a new PDF document
      const doc = new jsPDF();

      // Add hotel logo and header
      doc.setFillColor(41, 37, 36); // Dark gray header
      doc.rect(0, 0, doc.internal.pageSize.width, 30, "F");

      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("LuxeStay Hotels", 14, 15);
      doc.setFontSize(12);
      doc.text("Management Report", 14, 22);

      // Report title and date range
      doc.setTextColor(0, 0, 0); // Black text
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");

      let reportTitle = "";
      switch (activeReport) {
        case "occupancy":
          reportTitle = "Occupancy Report";
          break;
        case "financial":
          reportTitle = "Financial Report";
          break;
        case "noShow":
          reportTitle = "No-Show Report";
          break;
        case "revenue":
          reportTitle = "Revenue by Room Type Report";
          break;
        case "forecast":
          reportTitle = "Occupancy Forecast Report";
          break;
      }

      doc.text(reportTitle, 14, 40);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      if (dateRange?.from && dateRange?.to) {
        doc.text(
          `Date Range: ${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`,
          14,
          48
        );
      }
      doc.text(
        `Generated on: ${format(new Date(), "MMM dd, yyyy HH:mm")}`,
        14,
        54
      );

      // Report content based on type
      if (activeReport === "occupancy" && occupancyData) {
        // Summary section
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Occupancy Summary", 14, 65);

        // Calculate averages
        const totalOccupancy = occupancyData.reduce(
          (sum, day) => sum + day.occupancyRate,
          0
        );
        const averageOccupancy = totalOccupancy / occupancyData.length;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Average Occupancy Rate: ${averageOccupancy.toFixed(2)}%`,
          14,
          73
        );
        doc.text(
          `Total Available Rooms: ${occupancyData[0].totalRooms}`,
          14,
          79
        );

        // Table with daily data
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Daily Occupancy Breakdown", 14, 90);

        autoTable(doc, {
          startY: 95,
          head: [
            [
              "Date",
              "Reservations",
              "Occupancy Rate",
              "Occupied Rooms",
              "Available Rooms",
            ],
          ],
          body: occupancyData.map((data) => [
            format(data.reportDate, "MMM dd, yyyy"),
            data.reservations,
            `${data.occupancyRate}%`,
            data.occupiedRooms,
            data.totalRooms - data.occupiedRooms,
          ]),
          headStyles: {
            fillColor: [80, 80, 80],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240],
          },
        });
      } else if (activeReport === "financial" && financialData) {
        const totalRevenue = financialData.summary.totalRevenue ?? 0;
        const totalRoomRevenue = financialData.summary.totalRoomRevenue ?? 0;
        const totalServiceRevenue =
          financialData.summary.totalServiceRevenue ?? 0;
        const averageRevenue = financialData.summary.averageRevenue ?? 0;

        const roomRevenuePercentage =
          (totalRoomRevenue / totalRevenue) * 100 || 0;
        const serviceRevenuePercentage =
          (financialData.summary.totalServiceRevenue /
            financialData.summary.totalRevenue) *
            100 || 0;
        // Summary section
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Financial Summary", 14, 65);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Total Revenue: $${totalRevenue.toLocaleString()}`, 14, 73);
        doc.text(
          `Room Revenue: $${totalRoomRevenue.toLocaleString()} (${roomRevenuePercentage.toFixed(2)}%)`,
          14,
          79
        );
        doc.text(
          `Service Revenue: $${totalServiceRevenue.toLocaleString()} (${serviceRevenuePercentage.toFixed(2)}%)`,
          14,
          85
        );
        doc.text(
          `Average Daily Revenue: $${averageRevenue.toFixed(2)}`,
          14,
          91
        );

        // Table with daily data
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Daily Revenue Breakdown", 14, 102);

        autoTable(doc, {
          startY: 107,
          head: [
            [
              "Date",
              "Total Revenue",
              "Room Revenue",
              "Service Revenue",
              "Avg. Room Rate",
            ],
          ],
          body: financialData.dailyData.map((data) => [
            format(data.reportDate, "MMM dd, yyyy"),
            `$${data.totalRevenue.toLocaleString()}`,
            `$${data.roomRevenue.toLocaleString()}`,
            `$${data.serviceRevenue.toLocaleString()}`,
            `$${data.avgRoomRate.toLocaleString()}`,
          ]),
          headStyles: {
            fillColor: [80, 80, 80],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240],
          },
        });
      } else if (activeReport === "noShow" && noShowData) {
        // Summary section
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("No-Show Summary", 14, 65);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Total Reservations: ${noShowData.summary.totalReservations}`,
          14,
          73
        );
        doc.text(
          `Total No-Shows: ${noShowData.summary.totalNoShows} (${noShowData.summary.averageNoShowRate.toFixed(2)}%)`,
          14,
          79
        );

        // Table with daily data
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Daily No-Show Breakdown", 14, 96);

        autoTable(doc, {
          startY: 101,
          head: [["Date", "Reservations", "No-Shows", "No-Show Rate"]],
          body: noShowData.dailyData.map((day) => [
            format(day.date, "MMM dd, yyyy"),
            day.totalReservations,
            day.noShows,
            `${day.noShowRate.toFixed(2)}%`,
          ]),
          headStyles: {
            fillColor: [80, 80, 80],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240],
          },
        });
      } else if (activeReport === "revenue" && revenueByRoomTypeData) {
        // Summary section
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Revenue by Room Type", 14, 65);

        // Calculate total revenue
        const totalRevenue =
          revenueByRoomTypeData.reduce(
            (sum, roomType) => sum + roomType.revenue,
            0
          ) ?? 0;

        // Table with room type data
        autoTable(doc, {
          startY: 70,
          head: [
            [
              "Room Type",
              "Revenue",
              "% of Total",
              "Occupancy Rate",
              "Reservations",
              "Avg. Rate/Night",
            ],
          ],
          body: revenueByRoomTypeData.map((roomType) => {
            const percentage = totalRevenue
              ? ((roomType.revenue / totalRevenue) * 100).toFixed(2)
              : "0.00";
            return [
              roomType.roomTypeName,
              `$${roomType.revenue.toLocaleString()}`,
              `${percentage}%`,
              `${roomType.occupancyRate}%`,
              roomType.reservations,
              `$${roomType.averageRatePerNight.toLocaleString()}`,
            ];
          }),
          headStyles: {
            fillColor: [80, 80, 80],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240],
          },
        });

        // Add a summary row
        const finalY = (doc as any).lastAutoTable.finalY || 100;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(
          `Total Revenue: $${totalRevenue.toLocaleString()}`,
          14,
          finalY + 10
        );

        // Add a pie chart description
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Revenue Distribution", 14, finalY + 25);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        revenueByRoomTypeData.forEach((roomType, index) => {
          const percentage = (roomType.revenue / totalRevenue) * 100 || 0;
          doc.text(
            `${roomType.roomTypeName}: ${percentage.toFixed(2)}%`,
            14,
            finalY + 35 + index * 6
          );
        });
      } else if (activeReport === "forecast" && forecastData) {
        // Summary section
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Occupancy Forecast Summary", 14, 65);

        // Calculate averages
        const totalOccupancy = forecastData.data.reduce(
          (sum, day) => sum + day.forecastOccupancy,
          0
        );
        const averageOccupancy = totalOccupancy / forecastData.data.length;
        const totalProjectedRevenue = forecastData.data.reduce(
          (sum, day) => sum + day.projectedRevenue,
          0
        );

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Average Projected Occupancy: ${averageOccupancy.toFixed(2)}%`,
          14,
          73
        );
        doc.text(
          `Total Projected Revenue: $${totalProjectedRevenue.toLocaleString()}`,
          14,
          79
        );
        doc.text(`Forecast Period: ${forecastData.data.length} days`, 14, 85);

        // Table with forecast data
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Daily Forecast Breakdown", 14, 96);

        autoTable(doc, {
          startY: 101,
          head: [
            [
              "Date",
              "Forecast Occupancy",
              "Confirmed Reservations",
              "Projected Revenue",
            ],
          ],
          body: forecastData.data.map((day) => [
            format(new Date(day.forecastDate), "MMM dd, yyyy"),
            `${day.forecastOccupancy.toFixed(0)}%`,
            day.confirmedReservations,
            `$${day.projectedRevenue?.toLocaleString()}`,
          ]),
          headStyles: {
            fillColor: [80, 80, 80],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240],
          },
        });
      }

      // Footer
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${i} of ${pageCount} - LuxeStay Hotels Management Report - Generated on ${format(new Date(), "MMM dd, yyyy HH:mm")}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Convert to data URL for preview
      const pdfData = doc.output("datauristring");
      setPdfUrl(pdfData);

      toast({
        title: "Report generated successfully",
        description: "You can now preview, download or print the report.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error generating report",
        description:
          "There was an error generating the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!pdfUrl) {
      toast({
        title: "No report to download",
        description: "Please generate a report first.",
        variant: "destructive",
      });
      return;
    }

    // Create a new jsPDF instance to download
    const doc = new jsPDF();

    // Get the base64 data from the data URI
    const base64 = pdfUrl.split(",")[1];

    // Convert base64 to binary
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create a Blob and download
    const blob = new Blob([bytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${activeReport}-report-${format(new Date(), "yyyy-MM-dd")}.pdf`;
    link.click();

    toast({
      title: "Report downloaded",
      description: "The report has been downloaded successfully.",
    });
  };

  // Handle print
  const handlePrint = () => {
    if (!pdfUrl) {
      toast({
        title: "No report to print",
        description: "Please generate a report first.",
        variant: "destructive",
      });
      return;
    }

    const printWindow = window.open(pdfUrl, "_blank");
    if (printWindow) {
      printWindow.addEventListener("load", () => {
        printWindow.print();
      });
    }
  };

  // Generate PDF when report type or date range changes
  useEffect(() => {
    // Clear previous PDF
    setPdfUrl(null);

    // Generate new PDF if data is available
    const isDataAvailable =
      (activeReport === "occupancy" && occupancyData) ||
      (activeReport === "financial" && financialData) ||
      (activeReport === "noShow" && noShowData) ||
      (activeReport === "revenue" && revenueByRoomTypeData) ||
      (activeReport === "forecast" && forecastData);

    if (isDataAvailable) {
      generatePdf();
    }
  }, [
    activeReport,
    occupancyData,
    financialData,
    noShowData,
    revenueByRoomTypeData,
    forecastData,
  ]);

  // Determine if data is loading
  const isLoading =
    (activeReport === "occupancy" && isLoadingOccupancy) ||
    (activeReport === "financial" && isLoadingFinancial) ||
    (activeReport === "noShow" && isLoadingNoShow) ||
    (activeReport === "revenue" && isLoadingRevenueByRoomType) ||
    (activeReport === "forecast" && isLoadingForecast);

  // Handle refresh
  const handleRefresh = () => {
    switch (activeReport) {
      case "occupancy":
        refetchOccupancy();
        break;
      case "financial":
        refetchFinancial();
        break;
      case "noShow":
        refetchNoShow();
        break;
      case "revenue":
        refetchRevenueByRoomType();
        break;
      case "forecast":
        refetchForecast();
        break;
    }

    toast({
      title: "Refreshing report data",
      description: "The report data is being refreshed.",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Generate and view detailed reports for your hotel operations
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={activeReport}
              onValueChange={(value) => setActiveReport(value as ReportType)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="occupancy">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    <span>Occupancy Report</span>
                  </div>
                </SelectItem>
                <SelectItem value="financial">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Financial Report</span>
                  </div>
                </SelectItem>
                <SelectItem value="noShow">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>No-Show Report</span>
                  </div>
                </SelectItem>
                <SelectItem value="revenue">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Revenue by Room Type</span>
                  </div>
                </SelectItem>
                <SelectItem value="forecast">
                  <div className="flex items-center gap-2">
                    <Hotel className="h-4 w-4" />
                    <span>Occupancy Forecast</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading || isGenerating}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Report configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Settings</CardTitle>
                <CardDescription>
                  Configure your report parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Date Range</h3>
                  <DatePickerWithRange
                    date={dateRange}
                    onDateChange={handleDateRangeChange}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Quick Selections</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDateRange("today")}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDateRange("yesterday")}
                    >
                      Yesterday
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDateRange("thisWeek")}
                    >
                      This Week
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDateRange("lastWeek")}
                    >
                      Last Week
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDateRange("thisMonth")}
                    >
                      This Month
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDateRange("lastMonth")}
                    >
                      Last Month
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDateRange("next7Days")}
                    >
                      Next 7 Days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDateRange("next30Days")}
                    >
                      Next 30 Days
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Report Type</h3>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center space-x-3">
                        <Bed className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            Occupancy Report
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Room occupancy rates and statistics
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          activeReport === "occupancy" ? "default" : "outline"
                        }
                      >
                        {activeReport === "occupancy" ? "Selected" : "Select"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            Financial Report
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Revenue and financial performance
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          activeReport === "financial" ? "default" : "outline"
                        }
                      >
                        {activeReport === "financial" ? "Selected" : "Select"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">No-Show Report</p>
                          <p className="text-xs text-muted-foreground">
                            Track no-shows and lost revenue
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          activeReport === "noShow" ? "default" : "outline"
                        }
                      >
                        {activeReport === "noShow" ? "Selected" : "Select"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            Revenue by Room Type
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Revenue breakdown by room category
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          activeReport === "revenue" ? "default" : "outline"
                        }
                      >
                        {activeReport === "revenue" ? "Selected" : "Select"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center space-x-3">
                        <Hotel className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            Occupancy Forecast
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Projected occupancy and revenue
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          activeReport === "forecast" ? "default" : "outline"
                        }
                      >
                        {activeReport === "forecast" ? "Selected" : "Select"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isLoading || isGenerating}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
                <Button
                  onClick={generatePdf}
                  disabled={isLoading || isGenerating}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isGenerating ? "Generating..." : "Generate Report"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Actions</CardTitle>
                <CardDescription>
                  Download or print your generated report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleDownload}
                    disabled={!pdfUrl || isGenerating}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handlePrint}
                    disabled={!pdfUrl || isGenerating}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>
                    Reports are generated as PDF documents that can be
                    downloaded or printed.
                  </p>
                  <p className="mt-1">
                    All reports include a summary section and detailed data
                    tables.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - PDF Preview */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    PDF Preview
                  </CardTitle>
                  <CardDescription>
                    {dateRange?.from && dateRange?.to
                      ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
                      : "Select a date range"}
                  </CardDescription>
                </div>

                {isLoading || isGenerating ? (
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200"
                  >
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Loading...
                  </Badge>
                ) : pdfUrl ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Ready to view
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-slate-50 text-slate-700 border-slate-200"
                  >
                    No report generated
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div
                  ref={pdfContainerRef}
                  className="border rounded-md overflow-hidden bg-white"
                  style={{ height: "700px" }}
                >
                  {isLoading || isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Skeleton className="h-[500px] w-full" />
                      <div className="mt-4 text-center">
                        <p className="text-sm font-medium">
                          Generating report...
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          This may take a few moments
                        </p>
                      </div>
                    </div>
                  ) : pdfUrl ? (
                    <iframe
                      src={pdfUrl}
                      width="100%"
                      height="100%"
                      style={{ border: "none" }}
                      title="Report Preview"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">
                        No report generated yet
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 text-center max-w-md">
                        Select a report type and date range, then click
                        "Generate Report" to create a PDF report.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
