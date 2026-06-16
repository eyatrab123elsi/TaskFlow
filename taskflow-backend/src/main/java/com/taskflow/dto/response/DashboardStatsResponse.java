package com.taskflow.dto.response;

public record DashboardStatsResponse(
        long totalUsers,
        long activeUsers,
        long inactiveUsers,
        long adminCount,
        long projectManagerCount,
        long memberCount
) {}
