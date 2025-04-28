package models

// CodeSubmission represents the data structure for a code submission
type CodeSubmission struct {
	Code     string `json:"code" binding:"required"`
	Language string `json:"language"` // Not required, will be set from URL
}

// Response represents the standard API response structure
type Response struct {
	Success bool   `json:"success"`
	Output  string `json:"output,omitempty"`
	Error   string `json:"error,omitempty"`
}
