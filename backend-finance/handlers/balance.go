package handlers

import (
	"backend-finance/database"
	"backend-finance/models"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetBalance(c *gin.Context) {
	userID := c.Query("user_id")
	monthStr := c.Query("month")
	yearStr := c.Query("year")

	// Konversi ke integer
	month, _ := strconv.Atoi(monthStr)
	year, _ := strconv.Atoi(yearStr)

	var income, expenses float64
	database.DB.Model(&models.Transaction{}).
		Where("type = ? AND user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?", "income", userID, month, year).
		Select("SUM(amount)").Scan(&income)
	database.DB.Model(&models.Transaction{}).
		Where("type = ? AND user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?", "expense", userID, month, year).
		Select("SUM(amount)").Scan(&expenses)

	fmt.Println("userID:", userID, "month:", month, "year:", year, "expenses:", expenses)

	c.JSON(http.StatusOK, gin.H{
		"balance":  income - expenses,
		"income":   income,
		"expenses": expenses,
	})
}
