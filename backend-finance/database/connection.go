package database

import (
	"backend-finance/models"
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := "root:ZopPrUMiWuTerndSYxBeKMwpoXkApVLi@tcp(crossover.proxy.rlwy.net:12243)/railway?parseTime=true"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	fmt.Println("Successful Connection to Railway")
	db.AutoMigrate(&models.Transaction{})
	DB = db
}
