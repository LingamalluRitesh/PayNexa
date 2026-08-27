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

// Iso20022Service provides access to ISO 20022 pacs and camt XML generation.
type Iso20022Service struct {
	client HTTPClient
	baseURL string
	apiKey string
}

type HTTPClient interface {
	Do(req *http.Request) (*http.Response, error)
}

// NewIso20022Service initializes the resource service.
func NewIso20022Service(client HTTPClient, baseURL, apiKey string) *Iso20022Service {
	return &Iso20022Service{
		client: client,
		baseURL: baseURL,
		apiKey: apiKey,
	}
}

type Iso20022ServiceResponse struct {
	Status string `json:"status"`
	Data interface{} `json:"data,omitempty"`
	Error string `json:"error,omitempty"`
}

// Execute performs an authenticated HTTP request to the API.
func (s *Iso20022Service) Execute(ctx context.Context, method, endpoint string, payload interface{}) (*Iso20022ServiceResponse, error) {
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

	var apiResp Iso20022ServiceResponse
	if err := json.Unmarshal(bodyBytes, &apiResp); err != nil {
		return nil, fmt.Errorf("paynexa: failed to parse response JSON: %w", err)
	}

	return &apiResp, nil
}
