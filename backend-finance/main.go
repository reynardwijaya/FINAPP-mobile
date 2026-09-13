package main

import (
	"backend-finance/config"
	"backend-finance/database"
	"backend-finance/routes"
)

func main() {
	config.LoadEnv()
	database.ConnectDB()

	r := routes.SetupRouter()
	r.Run(":" + config.GetEnv("PORT", "8000"))
}
