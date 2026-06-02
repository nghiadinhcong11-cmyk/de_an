namespace RestaurantPOS.DTOs;

public class CreateOrderRequestDto
{
    public Guid TableId { get; set; }
    public string? CustomerName { get; set; }
    public List<OrderItemRequestDto> Items { get; set; } = new();
}

public class OrderItemRequestDto
{
    public Guid ProductId { get; set; }
    public Guid? VariantId { get; set; }
    public int Quantity { get; set; }
    public string? Note { get; set; }
}