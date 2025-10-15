package models

import "time"

type Transaction struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `json:"title"`
	Amount    float64   `json:"amount"`
	Date      time.Time `json:"date"`
	Category  string    `json:"category"`
	Type      string    `json:"type"`
	UserID    uint      `json:"user_id"` // tambahkan ini
	CreatedAt time.Time `json:"created_at"`
}
