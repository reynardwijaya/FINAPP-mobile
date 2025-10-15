package main

import (
	"backend-finance/database"
	"backend-finance/handlers"

	"github.com/gin-contrib/cors"

	"github.com/gin-gonic/gin"
)

func main() {
	database.ConnectDB()

	r := gin.Default()
	r.Use(cors.Default())
	r.POST("/login", handlers.Login)
	r.GET("/balance", handlers.GetBalance)
	r.GET("/expenses", handlers.GetExpenses)
	r.POST("/transactions", handlers.CreateTransaction)
	r.GET("/income", handlers.GetIncome)
	r.GET("/transactions", handlers.GetTransactions)
	r.DELETE("/transactions/:id", handlers.DeleteTransaction)
	r.GET("/analytics/spending-distribution", handlers.GetSpendingDistribution)
	r.GET("/analytics/monthly-trend", handlers.GetMonthlySpendingTrend)
	r.GET("/analytics/monthly-income-trend", handlers.GetMonthlyIncomeTrend)
	r.GET("/analytics/insights", handlers.GetInsights) // Baris yang ditambahkan

	r.Run(":8000")
}
