using Microsoft.AspNetCore.SignalR;

namespace RestaurantPOS.Infrastructure.Common;

public class NotificationHub : Hub
{
    // Nhân viên sẽ tham gia vào nhóm của chi nhánh để nhận thông báo riêng
    public async Task JoinBranchGroup(string branchId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, branchId);
    }
}