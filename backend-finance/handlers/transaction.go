package handlers

import (
	"backend-finance/database"
	"backend-finance/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetExpenses(c *gin.Context) {
	var expenses []models.Transaction
	database.DB.Where("type = ?", "expense").Find(&expenses)
	var result []gin.H
	for _, e := range expenses {
		result = append(result, gin.H{
			"id":         e.ID,
			"title":      e.Title,
			"amount":     e.Amount,
			"date":       e.Date,
			"category":   e.Category,
			"created_at": e.CreatedAt,
		})
	}
	c.JSON(http.StatusOK, gin.H{"expenses": result})
}

func GetIncome(c *gin.Context) {
	var incomes []models.Transaction
	database.DB.Where("type = ?", "income").Find(&incomes)
	var result []gin.H
	for _, e := range incomes {
		result = append(result, gin.H{
			"id":         e.ID,
			"title":      e.Title,
			"amount":     e.Amount,
			"date":       e.Date,
			"category":   e.Category,
			"created_at": e.CreatedAt,
		})
	}
	c.JSON(http.StatusOK, gin.H{"income": result})
}

func GetTransactions(c *gin.Context) {
	var txs []models.Transaction
	database.DB.Order("created_at desc").Limit(10).Find(&txs)
	var result []gin.H
	for _, t := range txs {
		result = append(result, gin.H{
			"id":         t.ID,
			"title":      t.Title,
			"amount":     t.Amount,
			"date":       t.Date,
			"type":       t.Type,
			"category":   t.Category,
			"created_at": t.CreatedAt,
		})
	}
	c.JSON(http.StatusOK, gin.H{"transactions": result})
}

func CreateTransaction(c *gin.Context) {
	var input models.Transaction
	if err := c.ShouldBindJSON(&input); err != nil {
		fmt.Println("BIND ERROR:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fmt.Printf("PAYLOAD DITERIMA: %+v\n", input)
	// Cek apakah user_id ada dan valid
	if input.UserID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transaction created successfully", "transaction": input})
}

func DeleteTransaction(c *gin.Context) {
	id := c.Param("id")
	fmt.Println("DeleteTransaction called with id:", id)
	var tx models.Transaction
	if err := database.DB.First(&tx, id).Error; err != nil {
		fmt.Println("Transaction not found:", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}
	if err := database.DB.Delete(&tx).Error; err != nil {
		fmt.Println("Failed to delete transaction:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete transaction"})
		return
	}
	fmt.Println("Transaction deleted successfully")
	c.JSON(http.StatusOK, gin.H{"message": "Transaction deleted successfully"})
}
