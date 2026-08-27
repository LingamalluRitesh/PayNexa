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

// TransfersService provides access to Peer-to-peer and interbank fund transfers.
type TransfersService struct {
	client HTTPClient
	baseURL string
	apiKey string
}

type HTTPClient interface {
	Do(req *http.Request) (*http.Response, error)
}

// NewTransfersService initializes the resource service.
func NewTransfersService(client HTTPClient, baseURL, apiKey string) *TransfersService {
	return &TransfersService{
		client: client,
		baseURL: baseURL,
		apiKey: apiKey,
	}
}

type TransfersServiceResponse struct {
	Status string `json:"status"`
	Data interface{} `json:"data,omitempty"`
	Error string `json:"error,omitempty"`
}

// Execute performs an authenticated HTTP request to the API.
func (s *TransfersService) Execute(ctx context.Context, method, endpoint string, payload interface{}) (*TransfersServiceResponse, error) {
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

	var apiResp TransfersServiceResponse
	if err := json.Unmarshal(bodyBytes, &apiResp); err != nil {
		return nil, fmt.Errorf("paynexa: failed to parse response JSON: %w", err)
	}

	return &apiResp, nil
}
