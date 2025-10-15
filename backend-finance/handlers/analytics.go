package handlers

import (
	"backend-finance/database"
	"backend-finance/models"
	"context" // Tambahkan ini
	"fmt"     // Tambahkan ini untuk fmt.Sprintf
	"net/http"
	"os" // Tambahkan ini untuk variabel lingkungan
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/google/generative-ai-go/genai" // Tambahkan ini
	"google.golang.org/api/option"             // Tambahkan ini
)

// GetSpendingDistribution mengembalikan distribusi pengeluaran berdasarkan kategori
func GetSpendingDistribution(c *gin.Context) {
	userIDStr := c.Query("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id"})
		return
	}

	monthStr := c.Query("month")
	yearStr := c.Query("year")

	var query *gorm.DB = database.DB.Model(&models.Transaction{}).
		Select("category, SUM(amount) as total_amount").
		Where("type = ? AND user_id = ?", "expense", userID)

	if monthStr != "" {
		month, err := strconv.Atoi(monthStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month"})
			return
		}
		query = query.Where("MONTH(date) = ?", month)
	}
	if yearStr != "" {
		year, err := strconv.Atoi(yearStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year"})
			return
		}
		query = query.Where("YEAR(date) = ?", year)
	}

	var results []struct {
		Category    string  `json:"category"`
		TotalAmount float64 `json:"total_amount"`
	}

	if err := query.Group("category").Order("total_amount DESC").Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": results})
}

// GetMonthlySpendingTrend mengembalikan tren pengeluaran bulanan untuk tahun tertentu
func GetMonthlySpendingTrend(c *gin.Context) {
	userIDStr := c.Query("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id"})
		return
	}

	yearStr := c.Query("year")
	if yearStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Year is required"})
		return
	}
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year"})
		return
	}

	var results []struct {
		Month       int     `json:"month"`
		TotalAmount float64 `json:"total_amount"`
	}

	if err := database.DB.Model(&models.Transaction{}).
		Select("MONTH(date) as month, SUM(amount) as total_amount").
		Where("type = ? AND user_id = ? AND YEAR(date) = ?", "expense", userID, year).
		Group("MONTH(date)").
		Order("month ASC").
		Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Inisialisasi slice dengan 12 bulan dan total 0
	monthlyDataMap := make(map[int]float64)
	for i := 1; i <= 12; i++ {
		monthlyDataMap[i] = 0.0
	}
	for _, r := range results {
		monthlyDataMap[r.Month] = r.TotalAmount
	}

	// Konversi map ke slice untuk memastikan urutan bulan
	var finalResults []gin.H
	for i := 1; i <= 12; i++ {
		finalResults = append(finalResults, gin.H{"month": i, "total_amount": monthlyDataMap[i]})
	}

	c.JSON(http.StatusOK, gin.H{"data": finalResults})
}

// GetMonthlyIncomeTrend mengembalikan tren pendapatan bulanan untuk tahun tertentu
func GetMonthlyIncomeTrend(c *gin.Context) {
	userIDStr := c.Query("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid User ID"})
		return
	}

	yearStr := c.Query("year")
	if yearStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Year is required"})
		return
	}

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year"})
		return
	}

	var results []struct {
		Month       int     `json:"month"`
		TotalAmount float64 `json:"total_amount"`
	}

	if err := database.DB.Model(&models.Transaction{}).
		Select("MONTH(date) as month, SUM(amount) as total_amount").
		Where("type = ? AND user_id = ? AND YEAR(date) = ?", "income", userID, year). // Filter type 'income'
		Group("MONTH(date)").
		Order("month ASC").
		Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch monthly income trend: " + err.Error()}) // Sertakan error untuk debugging
		return
	}

	// Inisialisasi slice dengan 12 bulan dan total 0
	monthlyDataMap := make(map[int]float64)
	for i := 1; i <= 12; i++ {
		monthlyDataMap[i] = 0.0
	}
	for _, r := range results {
		monthlyDataMap[r.Month] = r.TotalAmount
	}

	// Konversi map ke slice untuk memastikan urutan bulan
	var finalResults []gin.H
	for i := 1; i <= 12; i++ {
		finalResults = append(finalResults, gin.H{"month": i, "total_amount": monthlyDataMap[i]})
	}

	c.JSON(http.StatusOK, gin.H{"data": finalResults})
}

// GetInsights menghasilkan insight keuangan menggunakan Gemini API
func GetInsights(c *gin.Context) {
	ctx := context.Background()

	userIDStr := c.Query("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id"})
		return
	}

	monthStr := c.Query("month")
	yearStr := c.Query("year")

	// Validasi bulan dan tahun
	month, err := strconv.Atoi(monthStr)
	if err != nil || month < 1 || month > 12 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month"})
		return
	}
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year"})
		return
	}

	// Ambil Data Distribusi Pengeluaran untuk bulan dan tahun yang dipilih
	var spendingDistData []struct {
		Category    string  `json:"category"`
		TotalAmount float64 `json:"total_amount"`
	}
	if err := database.DB.Model(&models.Transaction{}).
		Select("category, SUM(amount) as total_amount").
		Where("type = ? AND user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?", "expense", userID, month, year).
		Group("category").Order("total_amount DESC").Scan(&spendingDistData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch spending distribution for insights: " + err.Error()})
		return
	}

	// Ambil Data Tren Pengeluaran Bulanan untuk tahun yang dipilih
	var monthlySpendingTrendData []struct {
		Month       int     `json:"month"`
		TotalAmount float64 `json:"total_amount"`
	}
	if err := database.DB.Model(&models.Transaction{}).
		Select("MONTH(date) as month, SUM(amount) as total_amount").
		Where("type = ? AND user_id = ? AND YEAR(date) = ?", "expense", userID, year).
		Group("MONTH(date)").
		Order("month ASC").
		Scan(&monthlySpendingTrendData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch monthly spending trend for insights: " + err.Error()})
		return
	}
	// Petakan data pengeluaran bulanan untuk 12 bulan penuh
	monthlySpendingMap := make(map[int]float64)
	for i := 1; i <= 12; i++ {
		monthlySpendingMap[i] = 0.0
	}
	for _, r := range monthlySpendingTrendData {
		monthlySpendingMap[r.Month] = r.TotalAmount
	}

	// Ambil Data Tren Pendapatan Bulanan untuk tahun yang dipilih
	var monthlyIncomeTrendData []struct {
		Month       int     `json:"month"`
		TotalAmount float64 `json:"total_amount"`
	}
	if err := database.DB.Model(&models.Transaction{}).
		Select("MONTH(date) as month, SUM(amount) as total_amount").
		Where("type = ? AND user_id = ? AND YEAR(date) = ?", "income", userID, year).
		Group("MONTH(date)").
		Order("month ASC").
		Scan(&monthlyIncomeTrendData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch monthly income trend for insights: " + err.Error()})
		return
	}
	// Petakan data pendapatan bulanan untuk 12 bulan penuh
	monthlyIncomeMap := make(map[int]float64)
	for i := 1; i <= 12; i++ {
		monthlyIncomeMap[i] = 0.0
	}
	for _, r := range monthlyIncomeTrendData {
		monthlyIncomeMap[r.Month] = r.TotalAmount
	}

	// Buat prompt untuk Gemini
	prompt := "Analisis data keuangan berikut dan berikan 3-5 insight utama yang ringkas. Fokus pada kebiasaan pengeluaran, tren pendapatan, observasi penting, dan potensi rekomendasi untuk peningkatan keuangan.\n\n"
	prompt += "Distribusi Pengeluaran untuk " + strconv.Itoa(month) + "/" + strconv.Itoa(year) + ":\n"
	if len(spendingDistData) == 0 {
		prompt += "- Tidak ada data pengeluaran untuk periode ini.\n"
	} else {
		for _, item := range spendingDistData {
			prompt += fmt.Sprintf("- Kategori: %s, Jumlah: Rp %.2f\n", item.Category, item.TotalAmount)
		}
	}

	prompt += "\nTren Pengeluaran Bulanan untuk " + strconv.Itoa(year) + ":\n"
	if len(monthlySpendingTrendData) == 0 {
		prompt += "- Tidak ada data tren pengeluaran bulanan untuk tahun ini.\n"
	} else {
		for i := 1; i <= 12; i++ {
			prompt += fmt.Sprintf("- Bulan %s: Rp %.2f\n", months[i-1], monthlySpendingMap[i]) // Gunakan nama bulan
		}
	}

	prompt += "\nTren Pendapatan Bulanan untuk " + strconv.Itoa(year) + ":\n"
	if len(monthlyIncomeTrendData) == 0 {
		prompt += "- Tidak ada data tren pendapatan bulanan untuk tahun ini.\n"
	} else {
		for i := 1; i <= 12; i++ {
			prompt += fmt.Sprintf("- Bulan %s: Rp %.2f\n", months[i-1], monthlyIncomeMap[i]) // Gunakan nama bulan
		}
	}

	// Inisialisasi klien Gemini
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Variabel lingkungan GEMINI_API_KEY tidak diatur"})
		return
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat klien Gemini: " + err.Error()})
		return
	}
	defer client.Close()

	// Gunakan model generatif
	model := client.GenerativeModel("gemini-1.5-flash-latest") // Ganti dengan nama model yang lebih baru

	// Hasilkan konten
	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghasilkan konten dari Gemini: " + err.Error()})
		return
	}

	if len(resp.Candidates) == 0 || resp.Candidates[0].Content == nil || len(resp.Candidates[0].Content.Parts) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Tidak ada konten yang dihasilkan dari Gemini"})
		return
	}

	var insightsText string
	for _, part := range resp.Candidates[0].Content.Parts {
		if text, ok := part.(genai.Text); ok {
			insightsText += string(text) + "\n"
		}
	}

	c.JSON(http.StatusOK, gin.H{"insights": insightsText})
}

// Helper slice untuk nama bulan (bisa ditempatkan di luar fungsi atau di util)
var months = []string{
	"Januari", "Februari", "Maret", "April", "Mei", "Juni",
	"Juli", "Agustus", "September", "Oktober", "November", "Desember",
}
