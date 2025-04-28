package main

import (
	"log"
	"time"

	"github.com/daveydark/code-submission-api/api/handlers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Create a new Gin router
	r := gin.Default()

	// Configure CORS to allow all origins
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"POST", "GET", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Create submission handler
	submissionHandler, err := handlers.NewSubmissionHandler()
	if err != nil {
		log.Fatalf("Failed to initialize submission handler: %v", err)
	}

	// Set up API routes
	api := r.Group("/submit")
	{
		// Using path params for languages
		api.POST("/:language", submissionHandler.HandleSubmission)

		// Keep the old routes for backward compatibility, but they'll use the new handler
		api.POST("/python", submissionHandler.HandleSubmission)
		api.POST("/javascript", submissionHandler.HandleSubmission)
		api.POST("/java", submissionHandler.HandleSubmission)
		api.POST("/cpp", submissionHandler.HandleSubmission)
		api.POST("/c", submissionHandler.HandleSubmission)
	}

	// Add a simple health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"time":   time.Now().Format(time.RFC3339),
		})
	})

	// Start the server
	log.Println("Starting server on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
