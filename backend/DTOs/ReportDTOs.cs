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
}