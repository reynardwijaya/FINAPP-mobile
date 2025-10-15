package handlers

import (
	"backend-finance/database"
	"backend-finance/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	c.BindJSON(&req)
	var user models.User
	if err := database.DB.Where("username = ? AND password = ?", req.Username, req.Password).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Username atau password salah"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"role":    user.Role,
		"name":    user.Name,
		"user_id": user.ID,
		"token":   "dummytoken",
	})
}
