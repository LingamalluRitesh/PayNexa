package resources

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// SwiftService provides access to SWIFT MT103 and MT940 wire transfers.
type SwiftService struct {
	client HTTPClient
	baseURL string
	apiKey string
}

type HTTPClient interface {
	Do(req *http.Request) (*http.Response, error)
}

// NewSwiftService initializes the resource service.
func NewSwiftService(client HTTPClient, baseURL, apiKey string) *SwiftService {
	return &SwiftService{
		client: client,
		baseURL: baseURL,
		apiKey: apiKey,
	}
}

type SwiftServiceResponse struct {
	Status string `json:"status"`
	Data interface{} `json:"data,omitempty"`
	Error string `json:"error,omitempty"`
}

// Execute performs an authenticated HTTP request to the API.
func (s *SwiftService) Execute(ctx context.Context, method, endpoint string, payload interface{}) (*SwiftServiceResponse, error) {
	var bodyReader io.Reader
	if payload != nil {
		data, err := json.Marshal(payload)
		if err != nil {
			return nil, fmt.Errorf("paynexa: failed to marshal payload: %w", err)
		}
		bodyReader = bytes.NewReader(data)
	}

	url := fmt.Sprintf("%s%s", s.baseURL, endpoint)
	req, err := http.NewRequestWithContext(ctx, method, url, bodyReader)
	if err != nil {
		return nil, fmt.Errorf("paynexa: failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer " + s.apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "PayNexa-Go-SDK/1.0.0")

	client := s.client
	if client == nil {
		client = &http.Client{Timeout: 30 * time.Second}
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("paynexa: network request failed: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("paynexa: failed to read response: %w", err)
	}

	var apiResp SwiftServiceResponse
	if err := json.Unmarshal(bodyBytes, &apiResp); err != nil {
		return nil, fmt.Errorf("paynexa: failed to parse response JSON: %w", err)
	}

	return &apiResp, nil
}
