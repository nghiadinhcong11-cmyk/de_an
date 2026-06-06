namespace RestaurantPOS.DTOs;

public class RevenueReportDto
{
    public string Date { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}

public class TopProductDto
{
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Revenue { get; set; }
}

public class BusinessOverviewDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetProfit { get; set; }
    public int TotalOrders { get; set; }
    public int TotalCustomers { get; set; }

    // Thêm các trường tăng trưởng
    public string RevenueTrend { get; set; } = "0%";
    public bool IsRevenueUp { get; set; } = true;
    public string OrderTrend { get; set; } = "0%";
    public bool IsOrderUp { get; set; } = true;
    public string ProfitTrend { get; set; } = "0%";
    public bool IsProfitUp { get; set; } = true;
    public string CustomerTrend { get; set; } = "0%";
    public bool IsCustomerUp { get; set; } = true;
}