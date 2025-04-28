package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/daveydark/code-submission-api/api/docker"
	"github.com/daveydark/code-submission-api/api/models"
	"github.com/gin-gonic/gin"
)

// SubmissionHandler handles code submission requests
type SubmissionHandler struct {
	sandbox *docker.DockerSandbox
}

// NewSubmissionHandler creates a new instance of SubmissionHandler
func NewSubmissionHandler() (*SubmissionHandler, error) {
	sandbox, err := docker.NewDockerSandbox()
	if err != nil {
		return nil, err
	}
	return &SubmissionHandler{sandbox: sandbox}, nil
}

// HandleSubmission handles the submission of code and runs it in a sandboxed environment
func (h *SubmissionHandler) HandleSubmission(c *gin.Context) {
	language := c.Param("language")
	log.Printf("Request received for language: '%s', URL: %s", language, c.Request.URL.Path)

	// If language is empty (direct endpoint), extract it from the URL path
	if language == "" {
		path := c.Request.URL.Path
		// Extract the language from the path (last segment)
		// URL will be like /submit/python
		parts := strings.Split(path, "/")
		if len(parts) > 0 {
			language = parts[len(parts)-1]
			log.Printf("Extracted language from URL path: %s", language)
		}
	}

	// Validate supported languages
	supportedLanguages := map[string]bool{
		"python":     true,
		"javascript": true,
		"java":       true,
		"cpp":        true,
		"c":          true,
	}

	log.Printf("Checking if language '%s' is supported", language)
	if !supportedLanguages[language] {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   fmt.Sprintf("Unsupported language: '%s'", language),
		})
		return
	}

	var submission models.CodeSubmission
	if err := c.ShouldBindJSON(&submission); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Invalid request body: " + err.Error(),
		})
		return
	}

	// Use the language from URL param, no need to validate against body
	submission.Language = language
	log.Printf("Submitting code for language: %s", language)

	// Run the code in a sandboxed environment
	output, err := h.sandbox.RunCode(language, submission.Code)
	if err != nil {
		c.JSON(http.StatusOK, models.Response{
			Success: false,
			Output:  output, // May contain partial output before error
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Output:  output,
	})
}
